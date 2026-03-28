import { useState, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';

const ICONS = {
    MembershipRenewalNotification: '💳',
    TournamentInvitationNotification: '📩',
    TournamentRegistrationNotification: '✅',
    TournamentReportNotification: '🏆',
    TrainerTournamentNotification: '📋',
};

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'zojuist';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m geleden`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}u geleden`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d geleden`;
    return date.toLocaleDateString('nl-BE');
}

export default function NotificationDropdown() {
    const { unreadNotificationCount } = usePage().props;
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/notifications');
            const data = await res.json();
            setNotifications(data);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        const next = !open;
        setOpen(next);
        if (next) fetchNotifications();
    };

    const markAsRead = async (id) => {
        await fetch(`/notifications/${id}/read`, { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content, 'Accept': 'application/json' } });
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        router.reload({ only: ['unreadNotificationCount'] });
    };

    const markAllAsRead = async () => {
        await fetch('/notifications/read-all', { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content, 'Accept': 'application/json' } });
        setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        router.reload({ only: ['unreadNotificationCount'] });
    };

    const count = unreadNotificationCount ?? 0;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={handleOpen}
                title="Meldingen"
                className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 004.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
                </svg>
                {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] rounded-xl bg-slate-900 shadow-xl ring-1 ring-slate-800/50 z-50 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                        <h3 className="text-sm font-semibold text-white">Meldingen</h3>
                        {notifications.some((n) => !n.read_at) && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                            >
                                Alles gelezen
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {loading && notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-slate-500">Laden...</div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-slate-500">Geen meldingen</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => !n.read_at && markAsRead(n.id)}
                                    className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-slate-800/50 transition-colors ${n.read_at ? 'opacity-60' : 'bg-slate-800/30 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <span className="text-lg flex-shrink-0 mt-0.5">{ICONS[n.type] || '🔔'}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-200 leading-snug">{n.data?.message || n.data?.title || 'Melding'}</p>
                                        {n.data?.detail && (
                                            <p className="text-xs text-slate-400 mt-0.5 truncate">{n.data.detail}</p>
                                        )}
                                        <p className="text-xs text-slate-500 mt-1">{timeAgo(n.created_at)}</p>
                                    </div>
                                    {!n.read_at && (
                                        <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-2"></span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
