import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';

export default function Session({ session, members }) {
    const [showExitModal, setShowExitModal] = useState(false);
    const [exitTimeLeft, setExitTimeLeft] = useState(15);
    const exitForm = useForm({ pin: '' });

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

    useEffect(() => {
        if (!showExitModal) return;
        if (exitTimeLeft <= 0) {
            closeExitModal();
            return;
        }
        const timer = setTimeout(() => setExitTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [showExitModal, exitTimeLeft]);

    const handleExitSubmit = (e) => {
        e.preventDefault();
        exitForm.post('/attendance/exit-to-choice');
    };

    const handleToggle = (memberId) => {
        router.post(`/attendance/session/${session.id}/toggle/${memberId}`, {}, {
            preserveScroll: true,
        });
    };

    const attendingCount = members.filter((m) => m.attending).length;

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
                            {attendingCount} / {members.length}
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
                    {members.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => handleToggle(m.id)}
                            className={`rounded-xl p-4 text-center transition-all active:scale-95 ${
                                m.attending
                                    ? 'bg-emerald-900/40 ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-900/20'
                                    : 'bg-slate-900 ring-1 ring-slate-700 hover:ring-slate-600'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold ${
                                m.attending
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-700 text-slate-400'
                            }`}>
                                {m.attending ? '✓' : m.name.charAt(0)}
                            </div>
                            <p className={`text-sm font-medium truncate ${
                                m.attending ? 'text-emerald-300' : 'text-slate-300'
                            }`}>
                                {m.name}
                            </p>
                        </button>
                    ))}
                </div>

                {members.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-lg text-slate-400">Geen leden in deze trainingsgroep</p>
                    </div>
                )}
            </div>

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
                                    onChange={(e) => { exitForm.setData('pin', e.target.value); resetExitTimer(); }}
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
                                <p className="text-sm text-slate-500">Nog <span className="font-mono font-semibold text-slate-400">{exitTimeLeft}</span> seconden</p>
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
        </div>
    );
}
