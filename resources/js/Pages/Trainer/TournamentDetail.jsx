import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import TournamentStepper from '../../Components/TournamentStepper';

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
        preparation: 'bg-slate-800 text-slate-300',
        invitations_sent: 'bg-rose-900/30 text-rose-300',
        registrations_open: 'bg-yellow-900/40 text-yellow-700',
        registrations_closed: 'bg-orange-100 text-orange-700',
        started: 'bg-emerald-900/40 text-emerald-400',
        finished: 'bg-purple-900/40 text-purple-400',
        archived: 'bg-purple-900/40 text-purple-400',
    };

    const filledCount = Object.values(results).filter(r => r.result !== '').length;
    const allFilled = totalParticipants > 0 && filledCount === totalParticipants;
    const canClose = t.status === 'started' && allFilled;
    const isFinished = t.status === 'finished' || t.status === 'archived';

    const handleClose = () => {
        if (!confirm('Weet je zeker dat je dit toernooi wilt afsluiten? Er wordt een verslag verstuurd naar alle geïnteresseerden.')) return;
        closeForm.post(`/trainer/toernooien/${t.id}/afsluiten`);
    };

    return (
        <AppLayout>
            <Head title={`Trainer - ${t.name}`} />

            <div className="mb-2 flex items-center gap-4">
                <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white">{t.name}</h1>
                <span className="inline-flex items-center rounded-full bg-rose-900/30 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                    Trainer modus
                </span>
            </div>

            <TournamentStepper status={t.status} />

            {flash.status && (
                <div className="mb-4 rounded-md bg-emerald-900/30 border ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column: Info + map */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700 p-5">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Details</h2>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-slate-500">Datum</dt>
                                <dd className="font-medium text-white">{formatDate(t.tournament_date)}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Locatie</dt>
                                <dd className="font-medium text-white">
                                    {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Land</dt>
                                <dd className="font-medium text-white">{t.country_code}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Deelnemers</dt>
                                <dd className="font-medium text-white">{totalParticipants}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-500">Resultaten ingevuld</dt>
                                <dd className="font-medium text-white">{filledCount} / {totalParticipants}</dd>
                            </div>
                        </dl>
                    </div>

                    {hasMap && (
                        <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700 overflow-hidden">
                            <iframe
                                title="Locatie"
                                width="100%"
                                height="220"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${t.longitude - 0.01},${t.latitude - 0.01},${parseFloat(t.longitude) + 0.01},${parseFloat(t.latitude) + 0.01}&layer=mapnik&marker=${t.latitude},${t.longitude}`}
                            />
                        </div>
                    )}

                    {t.coaches.length > 0 && (
                        <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700 p-5">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Trainers</h2>
                            <ul className="space-y-1">
                                {t.coaches.map(c => (
                                    <li key={c.id} className="text-sm text-white">{c.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {t.attachments.length > 0 && (
                        <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700 p-5">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Bijlagen</h2>
                            <ul className="space-y-1">
                                {t.attachments.map(att => (
                                    <li key={att.id}>
                                        <a href={att.url} target="_blank" rel="noopener noreferrer"
                                            className="text-sm text-rose-400 hover:underline">
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
                            className="w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
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
                                <p className="text-xs text-rose-600 text-center">
                                    Alle deelnemers moeten eerst een resultaat hebben voordat het toernooi kan worden afgesloten.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right column: Participants with result inputs */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700">
                        <div className="px-5 py-4 border-b border-slate-800">
                            <h2 className="text-lg font-semibold text-white">
                                Deelnemers & Resultaten
                                <span className="ml-2 inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                                    {totalParticipants}
                                </span>
                            </h2>
                        </div>

                        {participantGroups.length === 0 ? (
                            <div className="px-5 py-8 text-center text-slate-500">
                                Nog geen deelnemers.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700">
                                {participantGroups.map(ageGroup => (
                                    <div key={ageGroup.name} className="px-5 py-4">
                                        <h3 className="text-sm font-semibold text-slate-200 mb-3">
                                            <span className="inline-flex items-center rounded-full bg-rose-900/30 px-2.5 py-0.5 text-xs font-medium text-rose-300">
                                                {ageGroup.name}
                                            </span>
                                        </h3>
                                        <div className="space-y-3">
                                            {ageGroup.weights.map(weightGroup => (
                                                <div key={weightGroup.name} className="rounded-lg border border-slate-800 bg-slate-700/50 p-3">
                                                    <h4 className="text-xs font-semibold text-rose-400 mb-2">
                                                        <span className="inline-flex items-center rounded-full bg-rose-900/30 px-2 py-0.5">
                                                            {weightGroup.name}
                                                        </span>
                                                        <span className="ml-1.5 text-slate-400 font-normal">
                                                            ({weightGroup.members.length})
                                                        </span>
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {weightGroup.members.map(member => (
                                                            <div key={member.id} className="flex items-center gap-3 bg-slate-800 rounded-md p-2 border border-slate-800">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-white truncate">{member.name}</p>
                                                                </div>
                                                                <select
                                                                    value={results[member.id]?.result || ''}
                                                                    onChange={(e) => updateResult(member.id, 'result', e.target.value)}
                                                                    disabled={isFinished}
                                                                    className={`rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${isFinished ? 'bg-slate-800 cursor-not-allowed' : ''}`}
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
                                                                    className={`min-w-32 flex-1 rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none overflow-hidden ${isFinished ? 'bg-slate-800 cursor-not-allowed' : ''}`}
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
