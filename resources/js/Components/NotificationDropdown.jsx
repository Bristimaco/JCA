import { useState, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';

const ICONS = {
    MembershipRenewalNotification: '💳',
    TournamentInvitationNotification: '📩',
    TournamentRegistrationNotification: '✅',
    TournamentReportNotification: '🏆',
    TrainerTournamentNotification: '📋',
    MembershipPaymentNotification: '💶',
    PaymentConfirmationNotification: '✅',
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

function InfoRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex justify-between py-1.5 border-b border-slate-800/50 last:border-0">
            <span className="text-xs text-slate-400">{label}</span>
            <span className="text-xs font-medium text-slate-200 text-right">{value}</span>
        </div>
    );
}

function NotificationDetailView({ notification, onBack }) {
    const d = notification.data?.detail || {};
    const type = notification.type;

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-lg">{ICONS[type] || '🔔'}</span>
                <h3 className="text-sm font-semibold text-white truncate">{notification.data?.title}</h3>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">
                {d.body && <p className="text-sm text-slate-300 leading-relaxed">{d.body}</p>}

                <div className="rounded-lg bg-slate-800/50 ring-1 ring-slate-700/50 p-3 space-y-0.5">
                    {type === 'MembershipRenewalNotification' && (
                        <>
                            <InfoRow label="Lid" value={d.member_name} />
                            <InfoRow label="Vernieuwingsdatum" value={d.renewal_date} />
                            <InfoRow label="Club" value={d.club_name} />
                        </>
                    )}
                    {type === 'TournamentInvitationNotification' && (
                        <>
                            <InfoRow label="Lid" value={d.member_name} />
                            <InfoRow label="Toernooi" value={d.tournament_name} />
                            <InfoRow label="Datum" value={d.date} />
                            <InfoRow label="Antwoord vóór" value={d.rsvp_deadline} />
                            <InfoRow label="Locatie" value={d.address} />
                        </>
                    )}
                    {type === 'TournamentRegistrationNotification' && (
                        <>
                            <InfoRow label="Lid" value={d.member_name} />
                            <InfoRow label="Toernooi" value={d.tournament_name} />
                            <InfoRow label="Datum" value={d.date} />
                            <InfoRow label="Locatie" value={d.address} />
                            <InfoRow label="Leeftijdscategorie" value={d.age_category} />
                            <InfoRow label="Gewichtsklasse" value={d.weight_category} />
                        </>
                    )}
                    {type === 'TournamentReportNotification' && (
                        <>
                            <InfoRow label="Toernooi" value={d.tournament_name} />
                            <InfoRow label="Datum" value={d.date} />
                            <InfoRow label="Locatie" value={d.address} />
                        </>
                    )}
                    {type === 'TrainerTournamentNotification' && (
                        <>
                            <InfoRow label="Toernooi" value={d.tournament_name} />
                            <InfoRow label="Datum" value={d.date} />
                            <InfoRow label="Locatie" value={d.address} />
                            <InfoRow label="Uitnodiging deadline" value={d.invitation_deadline} />
                            <InfoRow label="Inschrijving deadline" value={d.registration_deadline} />
                        </>
                    )}
                    {type === 'MembershipPaymentNotification' && (
                        <>
                            <InfoRow label="Club" value={d.club_name} />
                            <InfoRow label="Jaar" value={d.year} />
                            <InfoRow label="Totaal" value={d.total_amount ? `€${d.total_amount}` : null} />
                            <InfoRow label="Vervaldatum" value={d.due_date} />
                            <InfoRow label="Status" value={d.status === 'paid' ? 'Betaald' : d.status === 'pending' ? 'In afwachting' : d.status === 'expired' ? 'Verlopen' : d.status} />
                        </>
                    )}
                    {type === 'PaymentConfirmationNotification' && (
                        <>
                            <InfoRow label="Club" value={d.club_name} />
                            <InfoRow label="Jaar" value={d.year} />
                            <InfoRow label="Totaal" value={d.total_amount ? `€${d.total_amount}` : null} />
                            <InfoRow label="Betaald op" value={d.paid_at} />
                        </>
                    )}
                </div>

                {type === 'TournamentInvitationNotification' && notification.data?.accept_url && (
                    <div className="flex gap-2">
                        <a href={notification.data.accept_url} className="flex-1 text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2 transition-colors">
                            ✓ Deelnemen
                        </a>
                        <a href={notification.data.decline_url} className="flex-1 text-center rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2 transition-colors">
                            ✗ Afwijzen
                        </a>
                    </div>
                )}

                {type === 'TournamentReportNotification' && d.results && d.results.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resultaten</p>
                        {d.results.map((group, gi) => (
                            <div key={gi}>
                                <p className="text-xs font-medium text-rose-400 mb-1">{group.category}</p>
                                <div className="rounded-lg bg-slate-800/40 ring-1 ring-slate-700/40 divide-y divide-slate-700/40">
                                    {group.participants.map((p, pi) => (
                                        <div key={pi} className="flex items-center justify-between px-3 py-2">
                                            <span className="text-xs text-slate-200">{p.name}</span>
                                            <div className="text-right">
                                                <span className="text-xs font-medium text-amber-400">{p.result}</span>
                                                {p.notes && <p className="text-[10px] text-slate-500">{p.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {type === 'TrainerTournamentNotification' && d.participants && d.participants.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Deelnemers ({d.participants.length})
                        </p>
                        <div className="rounded-lg bg-slate-800/40 ring-1 ring-slate-700/40 divide-y divide-slate-700/40">
                            {d.participants.map((p, pi) => (
                                <div key={pi} className="px-3 py-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-200">{p.name}</span>
                                        <span className="text-[10px] text-slate-500">{p.date_of_birth}</span>
                                    </div>
                                    <div className="flex gap-2 mt-0.5">
                                        <span className="text-[10px] text-slate-400">{p.age_category}</span>
                                        <span className="text-[10px] text-slate-500">•</span>
                                        <span className="text-[10px] text-slate-400">{p.weight_category}</span>
                                        <span className="text-[10px] text-slate-500">•</span>
                                        <span className="text-[10px] text-slate-400">{p.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {type === 'MembershipPaymentNotification' && d.lines && d.lines.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overzicht</p>
                        <div className="rounded-lg bg-slate-800/40 ring-1 ring-slate-700/40 divide-y divide-slate-700/40">
                            {d.lines.map((line, li) => (
                                <div key={li} className="flex items-center justify-between px-3 py-2">
                                    <div>
                                        <span className="text-xs font-medium text-slate-200">{line.member_name}</span>
                                        <p className="text-[10px] text-slate-500">{line.group_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-medium text-emerald-400">€{line.amount}</span>
                                        {line.is_discounted && <p className="text-[10px] text-blue-400">korting</p>}
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center justify-between px-3 py-2 bg-slate-800/60">
                                <span className="text-xs font-semibold text-slate-300">Totaal</span>
                                <span className="text-xs font-bold text-emerald-400">€{d.total_amount}</span>
                            </div>
                        </div>
                    </div>
                )}

                {type === 'MembershipPaymentNotification' && d.payment_url && (
                    <a
                        href={d.payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2.5 transition-colors"
                    >
                        💶 Nu betalen
                    </a>
                )}

                <p className="text-[10px] text-slate-600 text-center pt-2">{timeAgo(notification.created_at)}</p>
            </div>
        </div>
    );
}

export default function NotificationDropdown() {
    const { unreadNotificationCount } = usePage().props;
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
                setSelectedNotification(null);
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
        setSelectedNotification(null);
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

    const deleteNotification = async (id) => {
        await fetch(`/notifications/${id}`, { method: 'DELETE', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content, 'Accept': 'application/json' } });
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        router.reload({ only: ['unreadNotificationCount'] });
    };

    const handleNotificationClick = (n) => {
        if (!n.read_at) markAsRead(n.id);
        setSelectedNotification(n);
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
                    {selectedNotification ? (
                        <NotificationDetailView
                            notification={selectedNotification}
                            onBack={() => setSelectedNotification(null)}
                        />
                    ) : (
                        <>
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
                                            onClick={() => handleNotificationClick(n)}
                                            className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-slate-800/50 transition-colors ${n.read_at ? 'opacity-60 hover:opacity-80' : 'bg-slate-800/30 hover:bg-slate-800/50'}`}
                                        >
                                            <span className="text-lg flex-shrink-0 mt-0.5">{ICONS[n.type] || '🔔'}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-200 leading-snug">{n.data?.message || n.data?.title || 'Melding'}</p>
                                                <p className="text-xs text-slate-500 mt-1">{timeAgo(n.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0 mt-1.5">
                                                {n.read_at && (
                                                    <span
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                                        className="text-slate-600 hover:text-red-400 transition-colors"
                                                        title="Verwijderen"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </span>
                                                )}
                                                {!n.read_at && (
                                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                )}
                                                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
