import { router } from '@inertiajs/react';
import { useState } from 'react';

function timeAgo(dateString) {
    if (!dateString) return 'Nooit';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Zojuist';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min geleden`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} uur geleden`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} dagen geleden`;
    const months = Math.floor(days / 30);
    return `${months} maand${months > 1 ? 'en' : ''} geleden`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('nl-BE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const roleLabels = {
    admin: 'Beheerder',
    coach: 'Trainer',
    barmedewerker: 'Barmedewerker',
    parent: 'Ouder',
    member: 'Lid',
};

export default function ActivitySection({ activeSessions, inactiveUsers, loginLogs, inactiveDays }) {
    const [tab, setTab] = useState('active');
    const [selectedDays, setSelectedDays] = useState(inactiveDays);

    const tabs = [
        { key: 'active', label: 'Actieve Sessies', count: activeSessions.length },
        { key: 'history', label: 'Login Historiek', count: null },
        { key: 'inactive', label: 'Inactieve Gebruikers', count: inactiveUsers.length },
    ];

    function handleDaysChange(days) {
        setSelectedDays(days);
        router.get('/admin/activiteit', { inactive_days: days }, { preserveState: true, preserveScroll: true });
    }

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-slate-900 rounded-lg p-1 ring-1 ring-slate-800">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                            tab === t.key
                                ? 'bg-rose-700 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                        {t.label}
                        {t.count !== null && (
                            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                                tab === t.key ? 'bg-rose-600 text-rose-100' : 'bg-slate-800 text-slate-500'
                            }`}>
                                {t.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Active Sessions */}
            {tab === 'active' && (
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-x-auto">
                    {activeSessions.length === 0 ? (
                        <p className="p-6 text-slate-500 text-sm text-center">Geen actieve sessies op dit moment.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-left text-slate-400">
                                    <th className="px-4 py-3 font-medium">Gebruiker</th>
                                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Rol</th>
                                    <th className="px-4 py-3 font-medium text-right">Laatst actief</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {activeSessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-slate-800/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                <div>
                                                    <p className="text-white font-medium">{session.name}</p>
                                                    <p className="text-slate-500 text-xs">{session.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">
                                            {roleLabels[session.role] || session.role || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-400">
                                            {timeAgo(session.last_active_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Login History */}
            {tab === 'history' && (
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-x-auto">
                    {loginLogs.data.length === 0 ? (
                        <p className="p-6 text-slate-500 text-sm text-center">Nog geen login historiek.</p>
                    ) : (
                        <>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-left text-slate-400">
                                        <th className="px-4 py-3 font-medium">Gebruiker</th>
                                        <th className="px-4 py-3 font-medium hidden sm:table-cell">Rol</th>
                                        <th className="px-4 py-3 font-medium hidden md:table-cell">IP-adres</th>
                                        <th className="px-4 py-3 font-medium text-right">Ingelogd op</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {loginLogs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-800/30">
                                            <td className="px-4 py-3">
                                                <p className="text-white font-medium">{log.user_name}</p>
                                                <p className="text-slate-500 text-xs">{log.user_email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">
                                                {roleLabels[log.user_role] || log.user_role || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 hidden md:table-cell font-mono text-xs">
                                                {log.ip_address || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-400">
                                                {formatDate(log.logged_in_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {loginLogs.links && loginLogs.links.length > 3 && (
                                <div className="flex items-center justify-center gap-1 p-4 border-t border-slate-800">
                                    {loginLogs.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                                link.active
                                                    ? 'bg-rose-700 text-white'
                                                    : link.url
                                                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                                        : 'text-slate-600 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Inactive Users */}
            {tab === 'inactive' && (
                <div>
                    <div className="flex justify-end mb-3">
                        <select
                            value={selectedDays}
                            onChange={(e) => handleDaysChange(Number(e.target.value))}
                            className="bg-slate-800 text-slate-300 text-sm rounded-lg border border-slate-700 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        >
                            <option value={14}>Inactief &gt; 14 dagen</option>
                            <option value={30}>Inactief &gt; 30 dagen</option>
                            <option value={60}>Inactief &gt; 60 dagen</option>
                            <option value={90}>Inactief &gt; 90 dagen</option>
                        </select>
                    </div>

                    <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-x-auto">
                        {inactiveUsers.length === 0 ? (
                            <p className="p-6 text-slate-500 text-sm text-center">Geen inactieve gebruikers gevonden.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800 text-left text-slate-400">
                                        <th className="px-4 py-3 font-medium">Gebruiker</th>
                                        <th className="px-4 py-3 font-medium hidden sm:table-cell">Rol</th>
                                        <th className="px-4 py-3 font-medium text-right">Laatst gezien</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {inactiveUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-800/30">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                                                    <div>
                                                        <p className="text-white font-medium">{user.name}</p>
                                                        <p className="text-slate-500 text-xs">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">
                                                {roleLabels[user.role] || user.role || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-400">
                                                {user.last_active_at ? timeAgo(user.last_active_at) : 'Nooit ingelogd'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
