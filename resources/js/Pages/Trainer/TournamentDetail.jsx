import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
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

export default function TournamentDetail({ tournament, participantGroups, totalParticipants, podiumPhotos = {} }) {
    const { flash } = usePage().props;
    const t = tournament;
    const hasMap = t.latitude && t.longitude;
    const fileInputRef = useRef(null);
    const uploadTargetRef = useRef(null);

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
    const [activeFilters, setActiveFilters] = useState(() => participantGroups.map(g => g.name));
    const form = useForm({ results: [] });
    const closeForm = useForm({});

    const allCategoryNames = participantGroups.map(g => g.name);
    const allFiltersActive = activeFilters.length === allCategoryNames.length;

    const toggleFilter = (name) => {
        setActiveFilters(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const toggleAll = () => {
        setActiveFilters(allFiltersActive ? [] : [...allCategoryNames]);
    };

    const filteredGroups = participantGroups.filter(g => activeFilters.includes(g.name));
    const filteredParticipantCount = filteredGroups.reduce(
        (sum, g) => sum + g.weights.reduce((ws, w) => ws + w.members.length, 0), 0
    );

    const membersInGroup = (group) =>
        group.weights.reduce((sum, w) => sum + w.members.length, 0);

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

    const openPhotoPicker = (ageName, weightName) => {
        uploadTargetRef.current = { ageName, weightName };
        fileInputRef.current?.click();
    };

    const handlePhotoSelected = (e) => {
        const file = e.target.files?.[0];
        const target = uploadTargetRef.current;
        if (!file || !target) return;

        router.post(`/trainer/toernooien/${t.id}/podium-foto`, {
            age_category_name: target.ageName,
            weight_category_name: target.weightName,
            photo: file,
        }, {
            forceFormData: true,
        });

        uploadTargetRef.current = null;
        e.target.value = '';
    };

    const handleDeletePhoto = (ageName, weightName) => {
        if (!confirm('Podiumfoto verwijderen?')) return;
        router.delete(`/trainer/toernooien/${t.id}/podium-foto`, {
            data: { age_category_name: ageName, weight_category_name: weightName },
        });
    };

    return (
        <AppLayout>
            <Head title={`Trainer - ${t.name}`} />

            {/* Hidden file input for photo upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelected}
            />

            <div className="mb-2 flex items-center gap-2 sm:gap-4">
                <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
                    &larr; Dashboard
                </Link>
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">{t.name}</h1>
                <span className="hidden sm:inline-flex items-center rounded-full bg-rose-900/30 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                    Trainer modus
                </span>
            </div>

            <TournamentStepper status={t.status} />

            {flash.status && (
                <div className="mb-4 rounded-md bg-emerald-900/30 border ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}

            {/* Phone-only: collapsible info header */}
            <details className="sm:hidden mb-3 bg-slate-900 rounded-lg border border-slate-800 border-t-2 border-t-rose-700">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 truncate">
                            {formatDate(t.tournament_date)} &middot; {[t.address_city, t.country_code].filter(Boolean).join(', ') || 'Geen locatie'}
                        </p>
                    </div>
                    <span className="ml-3 inline-flex items-center rounded-full bg-rose-900/30 px-2.5 py-0.5 text-xs font-semibold text-rose-300 whitespace-nowrap">
                        {filledCount} / {totalParticipants}
                    </span>
                </summary>
                <div className="px-4 pb-4 space-y-3 border-t border-slate-800">
                    <dl className="space-y-2 text-sm pt-3">
                        <div className="flex justify-between">
                            <dt className="text-slate-500">Datum</dt>
                            <dd className="font-medium text-white text-right">{formatDate(t.tournament_date)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-500">Locatie</dt>
                            <dd className="font-medium text-white text-right">{[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-500">Land</dt>
                            <dd className="font-medium text-white">{t.country_code}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-500">Resultaten</dt>
                            <dd className="font-medium text-white">{filledCount} / {totalParticipants}</dd>
                        </div>
                    </dl>
                    {t.coaches.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Trainers</p>
                            <p className="text-sm text-white">{t.coaches.map(c => c.name).join(', ')}</p>
                        </div>
                    )}
                    {t.attachments.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bijlagen</p>
                            <div className="flex flex-wrap gap-2">
                                {t.attachments.map(att => (
                                    <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs text-rose-400 hover:underline">
                                        📎 {att.original_name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </details>

            {/* Phone-only: save + close buttons at top */}
            <div className="sm:hidden mb-3 space-y-2">
                {!isFinished && (
                    <button
                        onClick={handleSave}
                        disabled={form.processing}
                        className="w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                    >
                        {form.processing ? 'Opslaan...' : `Resultaten opslaan (${filledCount}/${totalParticipants})`}
                    </button>
                )}
                {t.status === 'started' && (
                    <>
                        <button
                            onClick={handleClose}
                            disabled={!canClose || closeForm.processing}
                            className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {closeForm.processing ? 'Afsluiten...' : 'Toernooi afsluiten'}
                        </button>
                        {!allFilled && (
                            <p className="text-xs text-rose-600 text-center">
                                Vul eerst alle resultaten in om af te sluiten.
                            </p>
                        )}
                    </>
                )}
            </div>

            <div className="grid gap-3 sm:gap-6 lg:grid-cols-3">
                {/* Left column: Info + map (hidden on phone — replaced by collapsible header above) */}
                <div className="hidden sm:block lg:col-span-1 space-y-4">
                    <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700 p-3 sm:p-5">
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
                        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-slate-800">
                            <h2 className="text-base sm:text-lg font-semibold text-white">
                                Deelnemers & Resultaten
                                <span className="ml-2 inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                                    {!allFiltersActive ? `${filteredParticipantCount} / ` : ''}{totalParticipants}
                                </span>
                            </h2>
                            {allCategoryNames.length > 1 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    <button
                                        onClick={toggleAll}
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${allFiltersActive
                                                ? 'bg-rose-600 text-white'
                                                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                                            }`}
                                    >
                                        Alles
                                    </button>
                                    {allCategoryNames.map(name => {
                                        const group = participantGroups.find(g => g.name === name);
                                        const count = group ? membersInGroup(group) : 0;
                                        const isActive = activeFilters.includes(name);
                                        return (
                                            <button
                                                key={name}
                                                onClick={() => toggleFilter(name)}
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${isActive
                                                        ? 'bg-rose-600 text-white'
                                                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                                                    }`}
                                            >
                                                {name} ({count})
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {participantGroups.length === 0 ? (
                            <div className="px-5 py-8 text-center text-slate-500">
                                Nog geen deelnemers.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700">
                                {filteredGroups.map(ageGroup => (
                                    <div key={ageGroup.name} className="px-3 sm:px-5 py-3 sm:py-4">
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
                                                            <div key={member.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-slate-800 rounded-md p-2.5 sm:p-2 border border-slate-800">
                                                                <div className="sm:flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-white truncate">{member.name}</p>
                                                                </div>
                                                                <select
                                                                    value={results[member.id]?.result || ''}
                                                                    onChange={(e) => updateResult(member.id, 'result', e.target.value)}
                                                                    disabled={isFinished}
                                                                    className={`w-full sm:w-auto rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-2.5 sm:py-1 px-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${isFinished ? 'bg-slate-800 cursor-not-allowed' : ''}`}
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
                                                                    className={`w-full sm:w-auto sm:min-w-32 sm:flex-1 rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-2.5 sm:py-1 px-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none overflow-hidden ${isFinished ? 'bg-slate-800 cursor-not-allowed' : ''}`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Podium photo */}
                                                    {(() => {
                                                        const photoKey = `${ageGroup.name}|${weightGroup.name}`;
                                                        const photoUrl = podiumPhotos[photoKey];
                                                        return (
                                                            <div className="mt-3 pt-3 border-t border-slate-700">
                                                                {photoUrl ? (
                                                                    <div className="flex items-start gap-3">
                                                                        <img src={photoUrl} alt="Podiumfoto" className="w-24 h-24 rounded-lg object-cover ring-1 ring-slate-700" />
                                                                        <div className="flex flex-col gap-1.5">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => openPhotoPicker(ageGroup.name, weightGroup.name)}
                                                                                className="text-xs text-slate-400 hover:text-white transition-colors"
                                                                            >
                                                                                📷 Vervangen
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeletePhoto(ageGroup.name, weightGroup.name)}
                                                                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                                                            >
                                                                                🗑 Verwijderen
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openPhotoPicker(ageGroup.name, weightGroup.name)}
                                                                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                                                        </svg>
                                                                        Podiumfoto toevoegen
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
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
