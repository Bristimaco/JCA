import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';

export default function Today({ sessions }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoutTimeLeft, setLogoutTimeLeft] = useState(15);
    const logoutForm = useForm({ pin: '' });

    const resetLogoutTimer = useCallback(() => setLogoutTimeLeft(15), []);

    const openLogoutModal = () => {
        logoutForm.reset();
        logoutForm.clearErrors();
        setLogoutTimeLeft(15);
        setShowLogoutModal(true);
    };

    const closeLogoutModal = () => {
        setShowLogoutModal(false);
        logoutForm.reset();
        logoutForm.clearErrors();
    };

    useEffect(() => {
        if (!showLogoutModal) return;
        if (logoutTimeLeft <= 0) {
            closeLogoutModal();
            return;
        }
        const timer = setTimeout(() => setLogoutTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [showLogoutModal, logoutTimeLeft]);

    const handleLogoutSubmit = (e) => {
        e.preventDefault();
        logoutForm.post('/attendance/logout');
    };
    useEffect(() => {
        if (sessions && sessions.length > 0) return;

        const interval = setInterval(() => {
            router.reload({ only: ['sessions'] });
        }, 10000);

        return () => clearInterval(interval);
    }, [sessions]);

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <Head title="Aanwezigheid - Vandaag" />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Actieve Trainingen</h1>
                        <p className="text-slate-400 mt-1">{new Date().toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.reload()}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700"
                        >
                            Vernieuwen
                        </button>
                        <button
                            onClick={openLogoutModal}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-red-400 hover:bg-slate-700 ring-1 ring-slate-700"
                        >
                            Afmelden
                        </button>
                    </div>
                </div>

                {(!sessions || sessions.length === 0) ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-lg text-slate-400">Geen actieve trainingen op dit moment</p>
                        <p className="text-sm text-slate-500 mt-1">Een trainer moet eerst een training openen</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sessions.map((s) => (
                            <Link
                                key={s.id}
                                href={`/attendance/session/${s.id}`}
                                className="group bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-emerald-600/60 p-6 hover:shadow-md hover:ring-emerald-500/40 hover:-translate-y-0.5 transition-all"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Open</span>
                                </div>
                                <p className="text-lg font-bold text-white">{s.group_name}</p>
                                <p className="text-sm text-slate-400 mt-1">{s.day} {s.start_time}{s.end_time ? `–${s.end_time}` : ''}</p>
                                {s.trainer_name && <p className="text-xs text-slate-500 mt-1">Trainer: {s.trainer_name}</p>}
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-sm font-medium text-slate-300">
                                        {s.attendance_count} aanwezig
                                    </span>
                                    <span className="text-xs font-medium text-rose-400 group-hover:text-rose-300">Registreren →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeLogoutModal}>
                    <div className="w-full max-w-sm mx-4 bg-slate-900 rounded-2xl ring-1 ring-slate-700 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-white">Kiosk afsluiten</h2>
                            <p className="text-sm text-slate-400 mt-1">Voer de PIN-code in om af te melden</p>
                        </div>

                        <form onSubmit={handleLogoutSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    autoComplete="off"
                                    value={logoutForm.data.pin}
                                    onChange={(e) => { logoutForm.setData('pin', e.target.value); resetLogoutTimer(); }}
                                    placeholder="PIN-code"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800/50 text-white text-center text-2xl tracking-[0.5em] py-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal"
                                    autoFocus
                                />
                                {logoutForm.errors.pin && (
                                    <p className="text-sm text-red-400 mt-2 text-center">{logoutForm.errors.pin}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={logoutForm.processing || !logoutForm.data.pin}
                                className="w-full rounded-xl bg-rose-600 px-4 py-3 text-base font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                            >
                                Afmelden
                            </button>

                            <div className="text-center">
                                <p className="text-sm text-slate-500">Nog <span className="font-mono font-semibold text-slate-400">{logoutTimeLeft}</span> seconden</p>
                                <div className="mt-2 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                                    <div className="h-full rounded-full bg-rose-600 transition-all duration-1000 ease-linear" style={{ width: `${(logoutTimeLeft / 15) * 100}%` }} />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeLogoutModal}
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
