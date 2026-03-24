import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';

const modules = [
    { name: 'Mijn Leden', href: '/mijn-leden', roles: ['parent', 'member', 'admin', 'coach'] },
    { name: 'Leden', href: '/admin/members', roles: ['admin'] },
    { name: 'Toernooien', href: '/admin/tournaments', roles: ['admin'] },
    { name: 'Archief', href: '/archief', roles: ['parent', 'member', 'admin', 'coach'] },
    { name: 'Admin', href: '/admin', roles: ['admin'] },
];

export default function Dashboard({ pendingCount, memberStats, myMemberCount, myTournaments, activeTournaments, coachTournaments }) {
    const { auth } = usePage().props;
    const role = auth.user.role;

    const visibleModules = modules.filter(
        (m) => m.roles.includes(role)
    );

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welkom, {auth.user.name}!</p>
            </div>

            {visibleModules.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {visibleModules.map((m) => (
                        <Link
                            key={m.name}
                            href={m.href}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-400 hover:shadow transition-all"
                        >
                            <div className="text-center">
                                <span className="text-lg font-semibold text-gray-900">{m.name}</span>
                                {m.name === 'Admin' && pendingCount > 0 && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                        {pendingCount}
                                    </span>
                                )}
                                {m.name === 'Leden' && memberStats && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                        {memberStats.total}
                                    </span>
                                )}
                                {m.name === 'Mijn Leden' && myMemberCount > 0 && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                        {myMemberCount}
                                    </span>
                                )}
                            </div>

                            {m.name === 'Leden' && memberStats && (memberStats.gender.length > 0 || memberStats.belts.length > 0) && (
                                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-left">
                                    {memberStats.gender.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Geslacht</p>
                                            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                                {memberStats.gender.map((g) => (
                                                    <span key={g.label} className="text-xs text-gray-600">
                                                        {g.label} <span className="font-medium text-gray-800">{g.count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {memberStats.belts.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Gordels</p>
                                            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                                {memberStats.belts.map((b) => (
                                                    <span key={b.label} className="text-xs text-gray-600">
                                                        {b.label} <span className="font-medium text-gray-800">{b.count}</span>
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

function ActiveTournaments({ tournaments }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE');
    };

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lopende Toernooien</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tournaments.map(t => (
                    <Link key={t.id} href={`/toernooien/${t.id}`} className="bg-white rounded-lg shadow-sm border-2 border-red-300 overflow-hidden hover:shadow-md transition-shadow">
                        {t.latitude && t.longitude && (
                            <iframe
                                title={`Locatie ${t.name}`}
                                width="100%"
                                height="140"
                                className="border-b border-gray-200 pointer-events-none"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${t.longitude - 0.01},${t.latitude - 0.01},${parseFloat(t.longitude) + 0.01},${parseFloat(t.latitude) + 0.01}&layer=mapnik&marker=${t.latitude},${t.longitude}`}
                            />
                        )}
                        <div className="p-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">Live</span>
                                <p className="font-medium text-gray-900">{t.name}</p>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{formatDate(t.tournament_date)}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                            </p>
                            <p className="mt-2 text-xs text-blue-600">Bekijk details →</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

const statusGroups = [
    { key: 'accepted', label: 'Geaccepteerd', color: 'bg-green-100 text-green-700' },
    { key: 'invited', label: 'Uitgenodigd', color: 'bg-blue-100 text-blue-700' },
    { key: 'declined', label: 'Afgeslagen', color: 'bg-red-100 text-red-700' },
    { key: 'pending', label: 'In afwachting', color: 'bg-gray-100 text-gray-600' },
];

function MyTournaments({ tournaments }) {
    const [expandedId, setExpandedId] = useState(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE');
    };

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mijn Toernooien</h2>
            {statusGroups.map(group => {
                const items = tournaments.filter(t => t.invitation_status === group.key);
                if (items.length === 0) return null;
                return (
                    <div key={group.key} className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                            {group.label}
                            <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${group.color}`}>
                                {items.length}
                            </span>
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map(t => (
                                <div key={t.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                                        <p className="font-medium text-gray-900">{t.name}</p>
                                        <p className="text-sm text-gray-500 mt-1">{formatDate(t.tournament_date)}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                        </p>
                                        {t.attachments && t.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {t.attachments.map(att => (
                                                    <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:underline">
                                                        {att.original_name}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                                            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            Deelnemers ({t.participants.length}) {expandedId === t.id ? '▲' : '▼'}
                                        </button>
                                        {expandedId === t.id && (
                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                {t.participants.length === 0 ? (
                                                    <p className="text-xs text-gray-400">Nog geen bevestigde deelnemers.</p>
                                                ) : (
                                                    <ul className="space-y-1">
                                                        {t.participants.map(p => (
                                                            <li key={p.id} className="flex items-center justify-between text-xs text-gray-700">
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
        started: 'bg-green-100 text-green-700',
        finished: 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                        className="bg-white rounded-lg shadow-sm border-2 border-amber-300 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[t.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {t.status_label}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                    Trainer
                                </span>
                            </div>
                            <p className="font-medium text-gray-900">{t.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{formatDate(t.tournament_date)}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{t.participant_count} deelnemers</p>
                            <p className="mt-2 text-xs text-amber-600 font-medium">Resultaten invullen →</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
