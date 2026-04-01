import { Link, usePage, useForm, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import NotificationDropdown from '../Components/NotificationDropdown';
import usePushSubscription from '../hooks/usePushSubscription';

export default function AppLayout({ children, fullWidth = false }) {
    const { auth, club } = usePage().props;
    const logoutForm = useForm();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifPref, setNotifPref] = useState(auth.user?.notification_preference || 'both');
    const menuRef = useRef(null);

    const { pushState, subscribe } = usePushSubscription();

    const handleLogout = (e) => {
        e.preventDefault();
        logoutForm.post('/logout');
    };

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950">
            <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/60 shadow-lg shadow-black/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center gap-2.5 group">
                                {club?.has_logo && (
                                    <img src="/club-logo" alt="" className="h-9 w-9 object-contain rounded-lg shadow-sm ring-1 ring-slate-600/50" />
                                )}
                                <span className="text-lg font-bold text-stone-100 tracking-tight group-hover:text-rose-400">
                                    {club?.name || 'JCA'}
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { window.location.reload(); }}
                                title="Pagina herladen"
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.451a.75.75 0 0 0 0-1.5H4.5a.75.75 0 0 0-.75.75v3.75a.75.75 0 0 0 1.5 0v-2.033l.364.363a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39l-.065.043Zm-10.624-2.85a5.5 5.5 0 0 1 9.201-2.465l.312.31H11.75a.75.75 0 0 0 0 1.5H15.5a.75.75 0 0 0 .75-.75V3.42a.75.75 0 0 0-1.5 0v2.033l-.364-.364A7 7 0 0 0 2.674 8.228a.75.75 0 0 0 1.449.39l.065-.044Z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <a
                                href="/handleiding.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Handleiding"
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3.25 3.25 0 1 1 4.596 4.596l-.459.459a1.75 1.75 0 0 0-.513 1.237V13a.75.75 0 0 1-1.5 0v-.878c0-.894.355-1.752.988-2.384l.459-.459a1.75 1.75 0 0 0-2.51-2.34ZM10 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                                </svg>
                            </a>

                            <NotificationDropdown />

                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-800/60"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className="text-sm font-medium text-slate-200 leading-tight">{auth.user.name}</p>
                                        {auth.user.role_label && (
                                            <p className="text-xs text-slate-400 leading-tight">{auth.user.role_label}</p>
                                        )}
                                    </div>
                                    <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 shadow-lg ring-1 ring-slate-800/50 py-1.5 z-50">
                                        <div className="px-3 py-2 border-b border-slate-800 sm:hidden">
                                            <p className="text-sm font-medium text-slate-200">{auth.user.name}</p>
                                            {auth.user.role_label && (
                                                <p className="text-xs text-slate-400">{auth.user.role_label}</p>
                                            )}
                                        </div>
                                        <div className="px-3 py-2 border-b border-slate-800">
                                            <p className="text-xs text-slate-500 mb-1.5">Meldingen via</p>
                                            <select
                                                value={notifPref}
                                                onChange={(e) => {
                                                    setNotifPref(e.target.value);
                                                    router.patch('/notifications/preference', { notification_preference: e.target.value }, { preserveScroll: true });
                                                }}
                                                className="w-full rounded-md border border-slate-600 bg-slate-800 text-white text-xs py-1 px-2 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                            >
                                                <option value="both">Email & In-app</option>
                                                <option value="email">Alleen email</option>
                                                <option value="app">Alleen in-app</option>
                                            </select>
                                        </div>
                                        {pushState === 'prompt' && (
                                            <div className="px-3 py-2 border-b border-slate-800">
                                                <button
                                                    onClick={subscribe}
                                                    className="w-full rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 flex items-center justify-center gap-1.5"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                    </svg>
                                                    Push notificaties activeren
                                                </button>
                                            </div>
                                        )}
                                        {pushState === 'denied' && (
                                            <div className="px-3 py-2 border-b border-slate-800">
                                                <p className="text-xs text-slate-500">Push notificaties geblokkeerd. Schakel ze in via je browser/apparaat instellingen.</p>
                                            </div>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            disabled={logoutForm.processing}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Uitloggen
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <main className={`py-8 px-4 sm:px-6 lg:px-8 ${fullWidth ? '' : 'max-w-7xl mx-auto'}`}>
                {children}
            </main>
        </div>
    );
}
