import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';

const moduleIcons = {
    'Mijn Leden': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
    ),
    'Leden': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
    ),
    'Toernooien': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-3.52 1.522m0 0a6.003 6.003 0 01-3.52-1.522" /></svg>
    ),
    'Archief': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
    ),
};

const moduleColors = {
    'Mijn Leden': 'from-blue-500 to-cyan-500',
    'Leden': 'from-indigo-500 to-blue-500',
    'Toernooien': 'from-amber-500 to-orange-500',
    'Archief': 'from-purple-500 to-indigo-500',
};

const modules = [
    { name: 'Mijn Leden', href: '/mijn-leden', roles: ['parent', 'member', 'admin', 'coach'] },
    { name: 'Leden', href: '/admin/members', roles: ['admin'] },
    { name: 'Toernooien', href: '/admin/tournaments', roles: ['admin'] },
    { name: 'Archief', href: '/archief', roles: ['parent', 'member', 'admin', 'coach'] },
];

export default function Dashboard({ pendingCount, pendingUsers, adminCounters, memberStats, myMemberCount, myTournaments, activeTournaments, coachTournaments, upcomingTournaments, recentArchived }) {
    const { auth } = usePage().props;
    const role = auth.user.role;

    const visibleModules = modules.filter(
        (m) => m.roles.includes(role)
    );

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 mt-1">Welkom terug, {auth.user.name}</p>
            </div>

            {role === 'admin' && (
                <AdminTile pendingCount={pendingCount} pendingUsers={pendingUsers} adminCounters={adminCounters} />
            )}

            {visibleModules.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {visibleModules.map((m) => (
                        <Link
                            key={m.name}
                            href={m.href}
                            className="group bg-white rounded-xl shadow-sm ring-1 ring-slate-200/60 p-5 hover:shadow-md hover:ring-slate-300 hover:-translate-y-0.5"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${moduleColors[m.name]} flex items-center justify-center text-white mb-3 shadow-sm group-hover:scale-105`}>
                                    {moduleIcons[m.name]}
                                </div>
                                <span className="text-base font-semibold text-slate-900">{m.name}</span>
                                {m.name === 'Leden' && memberStats && (
                                    <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                        {memberStats.total}
                                    </span>
                                )}
                                {m.name === 'Mijn Leden' && myMemberCount !== undefined && (
                                    <span className="mt-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                        {myMemberCount}
                                    </span>
                                )}
                            </div>

                            {m.name === 'Toernooien' && (
                                <div className="mt-3 pt-3 border-t border-slate-100 text-left">
                                    {upcomingTournaments && upcomingTournaments.length > 0 ? (
                                        <>
                                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Komende toernooien</p>
                                            <ul className="space-y-1">
                                                {upcomingTournaments.map((t) => (
                                                    <li key={t.id}>
                                                        <Link
                                                            href={`/toernooien/${t.id}`}
                                                            className="block text-sm text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {t.name}
                                                            <span className="text-xs text-slate-400 ml-1">{new Date(t.tournament_date).toLocaleDateString('nl-BE')}</span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-400">Geen geplande toernooien</p>
                                    )}
                                </div>
                            )}

                            {m.name === 'Archief' && recentArchived && recentArchived.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100 text-left">
                                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Laatste toernooien</p>
                                    <ul className="space-y-1">
                                        {recentArchived.map((t) => (
                                            <li key={t.id}>
                                                <Link
                                                    href={`/toernooien/${t.id}`}
                                                    className="block text-sm text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {t.name}
                                                    <span className="text-xs text-slate-400 ml-1">{new Date(t.tournament_date).toLocaleDateString('nl-BE')}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {m.name === 'Leden' && memberStats && (memberStats.gender.length > 0 || memberStats.belts.length > 0) && (
                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-left">
                                    {memberStats.gender.length > 0 && (
                                        <div>
                                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Geslacht</p>
                                            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                                {memberStats.gender.map((g) => (
                                                    <span key={g.label} className="text-xs text-slate-600">
                                                        {g.label} <span className="font-semibold text-slate-800">{g.count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {memberStats.belts.length > 0 && (
                                        <div>
                                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Gordels</p>
                                            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                                {memberStats.belts.map((b) => (
                                                    <span key={b.label} className="text-xs text-slate-600">
                                                        {b.label} <span className="font-semibold text-slate-800">{b.count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}

            {activeTournaments && activeTournaments.length > 0 && (
                <ActiveTournaments tournaments={activeTournaments} />
            )}

            {coachTournaments && coachTournaments.length > 0 && (
                <CoachTournaments tournaments={coachTournaments} />
            )}

            {myTournaments && myTournaments.length > 0 && (
                <MyTournaments tournaments={myTournaments} />
            )}
        </AppLayout>
    );
}

function AdminTile({ pendingCount, pendingUsers, adminCounters }) {
    const hasPending = pendingCount > 0;

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE');
    };

    const counters = [
        { label: 'Nieuwe aanvragen', value: pendingCount, icon: '👤', bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200/50' },
        { label: 'Inactieve leden', value: adminCounters?.inactiveMemberCount ?? 0, icon: '⏸', bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-200/50' },
        { label: 'Komende toernooien', value: adminCounters?.upcomingTournamentCount ?? 0, icon: '📅', bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-200/50' },
        { label: 'Actieve toernooien', value: adminCounters?.activeTournamentCount ?? 0, icon: '🏆', bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-200/50' },
    ];

    return (
        <Link
            href="/admin"
            className={`group block mb-6 rounded-xl shadow-sm ring-1 p-6 hover:shadow-md hover:-translate-y-0.5 ${hasPending
                ? 'ring-amber-300 bg-gradient-to-br from-amber-50 to-orange-50/50 hover:ring-amber-400'
                : 'ring-slate-200/60 bg-white hover:ring-slate-300'
                }`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Beheer</h2>
                </div>
                {hasPending && (
                    <span className="inline-flex items-center rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm animate-pulse">
                        {pendingCount} {pendingCount === 1 ? 'aanvraag' : 'aanvragen'}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                {counters.map((c) => (
                    <div key={c.label} className={`flex items-center justify-between rounded-lg ${c.bg} ring-1 ${c.ring} px-3 py-2.5`}>
                        <span className="text-xs font-medium text-slate-600">{c.label}</span>
                        <span className={`text-lg font-bold ${c.text}`}>{c.value}</span>
                    </div>
                ))}
            </div>

            {pendingUsers && pendingUsers.length > 0 && (
                <div className="border-t border-amber-200/60 pt-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Recente aanvragen</p>
                    <ul className="space-y-1.5">
                        {pendingUsers.map((u, i) => (
                            <li key={i} className="flex items-center justify-between text-sm">
                                <div>
                                    <span className="font-medium text-slate-900">{u.name}</span>
                                    <span className="ml-2 text-slate-400 text-xs">{u.email}</span>
                                </div>
                                <span className="text-xs text-slate-400">{formatDate(u.created_at)}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-2 text-xs text-amber-600 font-semibold group-hover:text-amber-700">Bekijk alle →</p>
                </div>
            )}
        </Link>
    );
}

function ActiveTournaments({ tournaments }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE');
    };

    return (
        <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Lopende Toernooien</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tournaments.map(t => (
                    <Link key={t.id} href={`/toernooien/${t.id}`} className="group bg-white rounded-xl shadow-sm ring-2 ring-red-200 overflow-hidden hover:shadow-md hover:ring-red-300 hover:-translate-y-0.5">
                        {t.latitude && t.longitude && (
                            <iframe
                                title={`Locatie ${t.name}`}
                                width="100%"
                                height="140"
                                className="border-b border-slate-200 pointer-events-none"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${t.longitude - 0.01},${t.latitude - 0.01},${parseFloat(t.longitude) + 0.01},${parseFloat(t.latitude) + 0.01}&layer=mapnik&marker=${t.latitude},${t.longitude}`}
                            />
                        )}
                        <div className="p-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2.5 py-0.5 text-xs font-semibold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                    Live
                                </span>
                                <p className="font-semibold text-slate-900">{t.name}</p>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">{formatDate(t.tournament_date)}</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                            </p>
                            <p className="mt-3 text-xs font-medium text-indigo-600 group-hover:text-indigo-700">Bekijk details →</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

const statusGroups = [
    { key: 'accepted', label: 'Geaccepteerd', color: 'bg-emerald-100 text-emerald-700' },
    { key: 'invited', label: 'Uitgenodigd', color: 'bg-blue-100 text-blue-700' },
    { key: 'declined', label: 'Afgeslagen', color: 'bg-red-100 text-red-700' },
    { key: 'pending', label: 'In afwachting', color: 'bg-slate-100 text-slate-600' },
];

function MyTournaments({ tournaments }) {
    const [expandedId, setExpandedId] = useState(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE');
    };

    return (
        <div className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Mijn Toernooien</h2>
            {statusGroups.map(group => {
                const items = tournaments.filter(t => t.invitation_status === group.key);
                if (items.length === 0) return null;
                return (
                    <div key={group.key} className="mb-6">
                        <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            {group.label}
                            <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${group.color}`}>
                                {items.length}
                            </span>
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map(t => (
                                <div key={t.id} className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden hover:shadow-md hover:-translate-y-0.5">
                                    {t.latitude && t.longitude && (
                                        <iframe
                                            title={`Locatie ${t.name}`}
                                            width="100%"
                                            height="140"
                                            className="border-b border-gray-200"
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${t.longitude - 0.01},${t.latitude - 0.01},${parseFloat(t.longitude) + 0.01},${parseFloat(t.latitude) + 0.01}&layer=mapnik&marker=${t.latitude},${t.longitude}`}
                                        />
                                    )}
                                    <div className="p-4">
                                        <p className="font-semibold text-slate-900">{t.name}</p>
                                        <p className="text-sm text-slate-500 mt-1">{formatDate(t.tournament_date)}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                        </p>
                                        {t.attachments && t.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {t.attachments.map(att => (
                                                    <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                                                        className="text-xs text-indigo-600 hover:underline">
                                                        {att.original_name}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                                            className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                        >
                                            Deelnemers ({t.participants.length}) {expandedId === t.id ? '▲' : '▼'}
                                        </button>
                                        {expandedId === t.id && (
                                            <div className="mt-2 pt-2 border-t border-slate-100">
                                                {t.participants.length === 0 ? (
                                                    <p className="text-xs text-slate-400">Nog geen bevestigde deelnemers.</p>
                                                ) : (
                                                    <ul className="space-y-1">
                                                        {t.participants.map(p => (
                                                            <li key={p.id} className="flex items-center justify-between text-xs text-slate-700">
                                                                <span>{p.name}</span>
                                                                {p.result && (
                                                                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${p.result === '1e plaats' ? 'bg-yellow-100 text-yellow-800' :
                                                                        p.result === '2e plaats' ? 'bg-gray-200 text-gray-800' :
                                                                            p.result === '3e plaats' ? 'bg-amber-100 text-amber-800' :
                                                                                'bg-gray-100 text-gray-600'
                                                                        }`}>
                                                                        {p.result}
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function CoachTournaments({ tournaments }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE');
    };

    const statusColors = {
        started: 'bg-emerald-100 text-emerald-700',
        finished: 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Mijn Toernooien als Trainer
                <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    {tournaments.length}
                </span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tournaments.map(t => (
                    <Link
                        key={t.id}
                        href={`/trainer/toernooien/${t.id}`}
                        className="group bg-white rounded-xl shadow-sm ring-2 ring-amber-200 overflow-hidden hover:shadow-md hover:ring-amber-300 hover:-translate-y-0.5"
                    >
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[t.status] || 'bg-slate-100 text-slate-700'}`}>
                                    {t.status_label}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                    Trainer
                                </span>
                            </div>
                            <p className="font-semibold text-slate-900">{t.name}</p>
                            <p className="text-sm text-slate-500 mt-1">{formatDate(t.tournament_date)}</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{t.participant_count} deelnemers</p>
                            <p className="mt-3 text-xs text-amber-600 font-semibold group-hover:text-amber-700">Resultaten invullen →</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
