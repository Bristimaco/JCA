import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';

export default function KioskChoice() {
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

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
            <Head title="Kiosk - Kies modus" />

            <div className="text-center mb-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center mx-auto mb-5 shadow-lg">
                    <span className="text-3xl font-bold text-white">柔</span>
                </div>
                <h1 className="text-3xl font-bold text-white">Kiosk Modus</h1>
                <p className="text-slate-400 mt-2">Kies welk scherm je wilt weergeven</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                {/* Trainingsdeelnames */}
                <Link
                    href="/attendance/today"
                    className="group bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-emerald-600/60 p-8 hover:shadow-xl hover:ring-emerald-500/40 hover:-translate-y-1 transition-all"
                >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-900/40 flex items-center justify-center mb-5">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Trainingsdeelnames</h2>
                    <p className="text-sm text-slate-400">Leden registreren hun aanwezigheid bij de training</p>
                    <div className="mt-5 flex items-center text-sm font-medium text-emerald-400 group-hover:text-emerald-300">
                        Openen <span className="ml-1">→</span>
                    </div>
                </Link>

                {/* Toernooi Resultaten */}
                <Link
                    href="/attendance/results"
                    className="group bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-yellow-600/60 p-8 hover:shadow-xl hover:ring-yellow-500/40 hover:-translate-y-1 transition-all"
                >
                    <div className="w-16 h-16 rounded-2xl bg-yellow-900/40 flex items-center justify-center mb-5">
                        <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Toernooi Resultaten</h2>
                    <p className="text-sm text-slate-400">Slideshow met resultaten van de laatste toernooien</p>
                    <div className="mt-5 flex items-center text-sm font-medium text-yellow-400 group-hover:text-yellow-300">
                        Openen <span className="ml-1">→</span>
                    </div>
                </Link>
            </div>

            {/* Logout button */}
            <button
                onClick={openLogoutModal}
                className="mt-12 rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-red-400 hover:bg-slate-700 ring-1 ring-slate-700 transition-colors"
            >
                Kiosk afsluiten
            </button>

            {/* Logout modal */}
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
