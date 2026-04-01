import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';

const BELT_COLORS = [
    { value: 'wit', label: 'Wit', bg: 'bg-white' },
    { value: 'geel', label: 'Geel', bg: 'bg-yellow-300' },
    { value: 'oranje', label: 'Oranje', bg: 'bg-orange-400' },
    { value: 'groen', label: 'Groen', bg: 'bg-green-500' },
    { value: 'blauw', label: 'Blauw', bg: 'bg-blue-500' },
    { value: 'bruin', label: 'Bruin', bg: 'bg-yellow-700' },
    { value: 'zwart', label: 'Zwart', bg: 'bg-black' },
];

export default function Session({ session, members, clubs }) {
    const [showExitModal, setShowExitModal] = useState(false);
    const [exitTimeLeft, setExitTimeLeft] = useState(15);
    const [showExternalModal, setShowExternalModal] = useState(false);
    const [showNewClubForm, setShowNewClubForm] = useState(false);
    const exitForm = useForm({ pin: '' });
    const externalForm = useForm({ name: '', belt_color: 'wit', club_id: '' });
    const clubForm = useForm({ name: '', club_number: '' });
    const [availableClubs, setAvailableClubs] = useState(clubs || []);

    const resetExitTimer = useCallback(() => setExitTimeLeft(15), []);

    const openExitModal = () => {
        exitForm.reset();
        exitForm.clearErrors();
        setExitTimeLeft(15);
        setShowExitModal(true);
    };

    const closeExitModal = () => {
        setShowExitModal(false);
        exitForm.reset();
        exitForm.clearErrors();
    };

    const closeExternalModal = () => {
        setShowExternalModal(false);
        setShowNewClubForm(false);
        externalForm.reset();
        clubForm.reset();
    };

    useEffect(() => {
        if (!showExitModal) return;
        if (exitTimeLeft <= 0) {
            closeExitModal();
            return;
        }
        const timer = setTimeout(() => setExitTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [showExitModal, exitTimeLeft]);

    // Auto-refresh every 10s to pick up new absences
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['members', 'session'], preserveScroll: true });
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleExitSubmit = (e) => {
        e.preventDefault();
        exitForm.post('/attendance/exit-to-choice');
    };

    const handleToggle = (memberId) => {
        router.post(
            route('attendance.session.toggle', { session: session.id }),
            { id: memberId },
            { preserveScroll: true }
        );
    };

    const handleRegisterExternal = (e) => {
        e.preventDefault();

        if (showNewClubForm && clubForm.data.name) {
            // Create new club first, then register external member
            router.post(
                route('clubs.store'),
                clubForm.data,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Refresh session data to get updated clubs list
                        router.reload({ only: ['session'] }, {
                            onSuccess: (page) => {
                                const newClub = page.props.clubs[page.props.clubs.length - 1];
                                if (newClub) {
                                    // Register with the newly created club
                                    router.post(
                                        route('attendance.session.external-member', { session: session.id }),
                                        {
                                            name: externalForm.data.name,
                                            belt_color: externalForm.data.belt_color,
                                            club_id: newClub.id,
                                        },
                                        {
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                closeExternalModal();
                                            },
                                        }
                                    );
                                }
                            },
                        });
                    },
                }
            );
        } else if (externalForm.data.club_id) {
            // Register with existing club
            router.post(
                route('attendance.session.external-member', { session: session.id }),
                {
                    name: externalForm.data.name,
                    belt_color: externalForm.data.belt_color,
                    club_id: externalForm.data.club_id,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        closeExternalModal();
                    },
                }
            );
        }
    };

    const allAttendees = [
        ...members,
        ...(session.external_attendances || []).map((ea) => ({
            id: `ext_${ea.id}`,
            name: ea.name,
            attending: !!ea.confirmed_at,
            belt_color: ea.belt_color,
            club_name: ea.club?.name || 'Onbekend',
            is_external: true,
            absent: false,
        })),
    ];

    const attendingCount = allAttendees.filter((m) => m.attending).length;

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <Head title={`Aanwezigheid - ${session.group_name}`} />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">{session.group_name}</h1>
                        <p className="text-slate-400 mt-1">
                            {session.day} {session.start_time}{session.end_time ? `–${session.end_time}` : ''}
                            {session.trainer_name && ` • ${session.trainer_name}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-full bg-emerald-900/40 px-3 py-1 text-sm font-semibold text-emerald-400">
                            {attendingCount} / {allAttendees.length}
                        </span>
                        <button
                            onClick={openExitModal}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-red-400 hover:bg-slate-700 ring-1 ring-slate-700"
                        >
                            Sluiten
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {/* Regular members and external members in grid */}
                    {allAttendees.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => !m.absent && handleToggle(m.id)}
                            disabled={m.absent}
                            className={`rounded-xl p-4 text-center transition-all active:scale-95 ${
                                m.absent
                                    ? 'bg-slate-900/50 ring-1 ring-slate-800 opacity-50 cursor-not-allowed'
                                    : m.attending
                                    ? 'bg-emerald-900/40 ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-900/20'
                                    : 'bg-slate-900 ring-1 ring-slate-700 hover:ring-slate-600'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold relative ${
                                m.absent
                                    ? 'bg-red-900/40 text-red-400'
                                    : m.attending
                                    ? 'bg-emerald-600 text-white'
                                    : m.is_external
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-700 text-slate-400'
                            }`}>
                                {m.absent ? '✗' : m.attending ? '✓' : m.name.charAt(0)}
                                {m.is_external && (
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-slate-950 flex items-center justify-center text-xs ${
                                        BELT_COLORS.find((bc) => bc.value === m.belt_color)?.bg || 'bg-gray-400'
                                    }`} />
                                )}
                            </div>
                            <p className={`text-sm font-medium truncate ${
                                m.absent ? 'text-red-400' : m.attending ? 'text-emerald-300' : 'text-slate-300'
                            }`}>
                                {m.name}
                            </p>
                            {m.is_external && (
                                <p className="text-[10px] font-semibold text-purple-400 mt-0.5 uppercase">{m.club_name}</p>
                            )}
                            {m.absent && (
                                <p className="text-[10px] font-semibold text-red-500 mt-0.5 uppercase">Afwezig</p>
                            )}
                        </button>
                    ))}

                    {/* "Add external member" tile */}
                    {session.allow_external_members && (
                        <button
                            onClick={() => setShowExternalModal(true)}
                            className="rounded-xl p-4 text-center transition-all active:scale-95 bg-gradient-to-br from-purple-900/20 to-purple-900/40 ring-2 ring-dashed ring-purple-500/60 hover:ring-purple-500 flex flex-col items-center justify-center"
                        >
                            <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl font-bold bg-purple-600/40 text-purple-300">
                                +
                            </div>
                            <p className="text-sm font-medium text-purple-300">Andere Club</p>
                        </button>
                    )}
                </div>

                {allAttendees.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-lg text-slate-400">Geen leden in deze trainingsgroep</p>
                    </div>
                )}
            </div>

            {/* Exit Modal */}
            {showExitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeExitModal}>
                    <div className="w-full max-w-sm mx-4 bg-slate-900 rounded-2xl ring-1 ring-slate-700 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-white">Scherm vergrendeld</h2>
                            <p className="text-sm text-slate-400 mt-1">Voer de PIN-code in om terug te gaan</p>
                        </div>

                        <form onSubmit={handleExitSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    autoComplete="off"
                                    value={exitForm.data.pin}
                                    onChange={(e) => {
                                        exitForm.setData('pin', e.target.value);
                                        resetExitTimer();
                                    }}
                                    placeholder="PIN-code"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800/50 text-white text-center text-2xl tracking-[0.5em] py-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal"
                                    autoFocus
                                />
                                {exitForm.errors.pin && (
                                    <p className="text-sm text-red-400 mt-2 text-center">{exitForm.errors.pin}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={exitForm.processing || !exitForm.data.pin}
                                className="w-full rounded-xl bg-rose-600 px-4 py-3 text-base font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                            >
                                Ontgrendelen
                            </button>

                            <div className="text-center">
                                <p className="text-sm text-slate-500">
                                    Nog <span className="font-mono font-semibold text-slate-400">{exitTimeLeft}</span> seconden
                                </p>
                                <div className="mt-2 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                                    <div className="h-full rounded-full bg-rose-600 transition-all duration-1000 ease-linear" style={{ width: `${(exitTimeLeft / 15) * 100}%` }} />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeExitModal}
                                className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-700 transition-colors"
                            >
                                Annuleren
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* External Member Registration Modal */}
            {showExternalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeExternalModal}>
                    <div
                        className="w-full max-w-md bg-slate-900 rounded-2xl ring-1 ring-slate-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-white">Deelnemer van andere club</h2>
                        </div>

                        <form onSubmit={handleRegisterExternal} className="space-y-4">
                            {!showNewClubForm ? (
                                <>
                                    {/* Name input */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Naam</label>
                                        <input
                                            type="text"
                                            value={externalForm.data.name}
                                            onChange={(e) => externalForm.setData('name', e.target.value)}
                                            placeholder="Voornaam en achternaam"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-600 px-4 py-2 focus:border-purple-500 focus:ring-purple-500"
                                            autoFocus
                                        />
                                        {externalForm.errors.name && (
                                            <p className="text-sm text-red-400 mt-1">{externalForm.errors.name}</p>
                                        )}
                                    </div>

                                    {/* Belt color select */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Bandkleur</label>
                                        <select
                                            value={externalForm.data.belt_color}
                                            onChange={(e) => externalForm.setData('belt_color', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 text-white px-4 py-2 focus:border-purple-500 focus:ring-purple-500"
                                        >
                                            {BELT_COLORS.map((color) => (
                                                <option key={color.value} value={color.value}>
                                                    {color.label}
                                                </option>
                                            ))}
                                        </select>
                                        {externalForm.errors.belt_color && (
                                            <p className="text-sm text-red-400 mt-1">{externalForm.errors.belt_color}</p>
                                        )}
                                    </div>

                                    {/* Club select */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Club</label>
                                        <div className="relative">
                                            <select
                                                value={externalForm.data.club_id}
                                                onChange={(e) => externalForm.setData('club_id', e.target.value)}
                                                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 text-white px-4 py-2 focus:border-purple-500 focus:ring-purple-500 appearance-none"
                                            >
                                                <option value="">-- Selecteer een club --</option>
                                                {availableClubs.map((club) => (
                                                    <option key={club.id} value={club.id}>
                                                        {club.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                        {externalForm.errors.club_id && (
                                            <p className="text-sm text-red-400 mt-1">{externalForm.errors.club_id}</p>
                                        )}
                                    </div>

                                    {/* Add new club button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowNewClubForm(true)}
                                        className="w-full text-sm font-medium text-purple-400 hover:text-purple-300 py-2 px-4 rounded-lg border border-purple-500/30 hover:border-purple-500/60 transition-colors"
                                    >
                                        + Club toevoegen
                                    </button>

                                    {/* Action buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeExternalModal}
                                            className="flex-1 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-700 transition-colors"
                                        >
                                            Annuleren
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={externalForm.processing || !externalForm.data.name || !externalForm.data.club_id}
                                            className="flex-1 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                        >
                                            Aanmelden
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* New club form */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Clubnaam</label>
                                        <input
                                            type="text"
                                            value={clubForm.data.name}
                                            onChange={(e) => clubForm.setData('name', e.target.value)}
                                            placeholder="Naam van de club"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-600 px-4 py-2 focus:border-purple-500 focus:ring-purple-500"
                                            autoFocus
                                        />
                                        {clubForm.errors.name && (
                                            <p className="text-sm text-red-400 mt-1">{clubForm.errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Clubnummer</label>
                                        <input
                                            type="text"
                                            value={clubForm.data.club_number}
                                            onChange={(e) => clubForm.setData('club_number', e.target.value)}
                                            placeholder="Bijv. JC-001"
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-600 px-4 py-2 focus:border-purple-500 focus:ring-purple-500"
                                        />
                                        {clubForm.errors.club_number && (
                                            <p className="text-sm text-red-400 mt-1">{clubForm.errors.club_number}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewClubForm(false)}
                                            className="flex-1 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-700 transition-colors"
                                        >
                                            Terug
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (clubForm.data.name) {
                                                    router.post(
                                                        route('clubs.store'),
                                                        clubForm.data,
                                                        {
                                                            preserveScroll: true,
                                                            onSuccess: (page) => {
                                                                const newClub = page.props.clubs[page.props.clubs.length - 1];
                                                                if (newClub) {
                                                                    setAvailableClubs([...availableClubs, newClub]);
                                                                    externalForm.setData('club_id', newClub.id);
                                                                    clubForm.reset();
                                                                    setShowNewClubForm(false);
                                                                }
                                                            },
                                                        }
                                                    );
                                                }
                                            }}
                                            disabled={clubForm.processing || !clubForm.data.name}
                                            className="flex-1 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                        >
                                            Opslaan
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
