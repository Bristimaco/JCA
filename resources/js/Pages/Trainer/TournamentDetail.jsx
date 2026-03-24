import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

const resultOptions = [
    { value: '', label: '— Kies resultaat —' },
    { value: '1e plaats', label: '🥇 1e plaats' },
    { value: '2e plaats', label: '🥈 2e plaats' },
    { value: '3e plaats', label: '🥉 3e plaats' },
    { value: '5e plaats', label: '5e plaats' },
    { value: '7e plaats', label: '7e plaats' },
    { value: 'Deelgenomen', label: 'Deelgenomen' },
    { value: 'Niet opgekomen', label: 'Niet opgekomen' },
    { value: 'Gediskwalificeerd', label: 'Gediskwalificeerd' },
];

export default function TournamentDetail({ tournament, participantGroups, totalParticipants }) {
    const { flash } = usePage().props;
    const t = tournament;
    const hasMap = t.latitude && t.longitude;

    // Build initial results state from existing data
    const buildInitialResults = () => {
        const results = {};
        participantGroups.forEach(ageGroup => {
            ageGroup.weights.forEach(weightGroup => {
                weightGroup.members.forEach(member => {
                    results[member.id] = {
                        result: member.result || '',
                        notes: member.notes || '',
                    };
                });
            });
        });
        return results;
    };

    const [results, setResults] = useState(buildInitialResults);
    const form = useForm({ results: [] });
    const closeForm = useForm({});

    const updateResult = (memberId, field, value) => {
        setResults(prev => ({
            ...prev,
            [memberId]: { ...prev[memberId], [field]: value },
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        const payload = Object.entries(results)
            .filter(([, val]) => val.result !== '')
            .map(([memberId, val]) => ({
                member_id: parseInt(memberId),
                result: val.result,
                notes: val.notes || null,
            }));

        form.transform(() => ({ results: payload }));
        form.post(`/trainer/toernooien/${t.id}/resultaten`);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const statusColors = {
        preparation: 'bg-gray-100 text-gray-700',
        invitations_sent: 'bg-blue-100 text-blue-700',
        registrations_open: 'bg-yellow-100 text-yellow-700',
        registrations_closed: 'bg-orange-100 text-orange-700',
        started: 'bg-green-100 text-green-700',
        finished: 'bg-purple-100 text-purple-700',
    };

    const filledCount = Object.values(results).filter(r => r.result !== '').length;
    const allFilled = totalParticipants > 0 && filledCount === totalParticipants;
    const canClose = t.status === 'started' && allFilled;
    const isFinished = t.status === 'finished';

    const handleClose = () => {
        if (!confirm('Weet je zeker dat je dit toernooi wilt afsluiten? Er wordt een verslag verstuurd naar alle geïnteresseerden.')) return;
        closeForm.post(`/trainer/toernooien/${t.id}/afsluiten`);
    };

    return (
        <AppLayout>
            <Head title={`Trainer - ${t.name}`} />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{t.name}</h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[t.status] || ''}`}>
                    {t.status_label}
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    Trainer modus
                </span>
            </div>

            {flash.status && (
                <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-3">
                    <p className="text-sm text-green-800">{flash.status}</p>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column: Info + map */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Details</h2>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-gray-500">Datum</dt>
                                <dd className="font-medium text-gray-900">{formatDate(t.tournament_date)}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Locatie</dt>
                                <dd className="font-medium text-gray-900">
                                    {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Land</dt>
                                <dd className="font-medium text-gray-900">{t.country_code}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Deelnemers</dt>
                                <dd className="font-medium text-gray-900">{totalParticipants}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Resultaten ingevuld</dt>
                                <dd className="font-medium text-gray-900">{filledCount} / {totalParticipants}</dd>
                            </div>
                        </dl>
                    </div>

                    {hasMap && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <iframe
                                title="Locatie"
                                width="100%"
                                height="220"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${t.longitude - 0.01},${t.latitude - 0.01},${parseFloat(t.longitude) + 0.01},${parseFloat(t.latitude) + 0.01}&layer=mapnik&marker=${t.latitude},${t.longitude}`}
                            />
                        </div>
                    )}

                    {t.coaches.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Trainers</h2>
                            <ul className="space-y-1">
                                {t.coaches.map(c => (
                                    <li key={c.id} className="text-sm text-gray-900">{c.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {t.attachments.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bijlagen</h2>
                            <ul className="space-y-1">
                                {t.attachments.map(att => (
                                    <li key={att.id}>
                                        <a href={att.url} target="_blank" rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline">
                                            {att.original_name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Save button */}
                    {!isFinished && (
                        <button
                            onClick={handleSave}
                            disabled={form.processing}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {form.processing ? 'Opslaan...' : 'Resultaten opslaan'}
                        </button>
                    )}

                    {/* Close tournament button */}
                    {t.status === 'started' && (
                        <div className="space-y-2">
                            <button
                                onClick={handleClose}
                                disabled={!canClose || closeForm.processing}
                                className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {closeForm.processing ? 'Afsluiten...' : 'Toernooi afsluiten'}
                            </button>
                            {!allFilled && (
                                <p className="text-xs text-amber-600 text-center">
                                    Alle deelnemers moeten eerst een resultaat hebben voordat het toernooi kan worden afgesloten.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right column: Participants with result inputs */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Deelnemers & Resultaten
                                <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                    {totalParticipants}
                                </span>
                            </h2>
                        </div>

                        {participantGroups.length === 0 ? (
                            <div className="px-5 py-8 text-center text-gray-500">
                                Nog geen deelnemers.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {participantGroups.map(ageGroup => (
                                    <div key={ageGroup.name} className="px-5 py-4">
                                        <h3 className="text-sm font-semibold text-gray-800 mb-3">
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                {ageGroup.name}
                                            </span>
                                        </h3>
                                        <div className="space-y-3">
                                            {ageGroup.weights.map(weightGroup => (
                                                <div key={weightGroup.name} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                                    <h4 className="text-xs font-semibold text-amber-700 mb-2">
                                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5">
                                                            {weightGroup.name}
                                                        </span>
                                                        <span className="ml-1.5 text-gray-400 font-normal">
                                                            ({weightGroup.members.length})
                                                        </span>
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {weightGroup.members.map(member => (
                                                            <div key={member.id} className="flex items-center gap-3 bg-white rounded-md p-2 border border-gray-100">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                                                                </div>
                                                                <select
                                                                    value={results[member.id]?.result || ''}
                                                                    onChange={(e) => updateResult(member.id, 'result', e.target.value)}
                                                                    disabled={isFinished}
                                                                    className={`rounded-md border border-gray-300 text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isFinished ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                >
                                                                    {resultOptions.map(opt => (
                                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                    ))}
                                                                </select>
                                                                <textarea
                                                                    placeholder="Opmerking..."
                                                                    value={results[member.id]?.notes || ''}
                                                                    onChange={(e) => updateResult(member.id, 'notes', e.target.value)}
                                                                    disabled={isFinished}
                                                                    rows={1}
                                                                    onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                                                    className={`min-w-32 flex-1 rounded-md border border-gray-300 text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-hidden ${isFinished ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
