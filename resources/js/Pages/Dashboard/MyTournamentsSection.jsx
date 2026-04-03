import { useState } from 'react';
import TournamentStepper from '../../Components/TournamentStepper';

const statusGroups = [
    { key: 'accepted', label: 'Geaccepteerd', color: 'bg-emerald-900/40 text-emerald-400' },
    { key: 'invited', label: 'Uitgenodigd', color: 'bg-blue-900/40 text-blue-400' },
    { key: 'declined', label: 'Afgeslagen', color: 'bg-red-900/40 text-red-400' },
    { key: 'pending', label: 'In afwachting', color: 'bg-slate-700 text-slate-300' },
];

export default function MyTournamentsSection({ tournaments }) {
    const [expandedId, setExpandedId] = useState(null);
    const [collapsedGroups, setCollapsedGroups] = useState(() => new Set(statusGroups.map(g => g.key)));

    const toggleGroup = (key) => setCollapsedGroups(prev => {
        const next = new Set(prev);
        next.has(key) ? next.delete(key) : next.add(key);
        return next;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE');
    };

    return (
        <div>
            {statusGroups.map(group => {
                const items = tournaments.filter(t => t.invitation_status === group.key);
                if (items.length === 0) return null;
                return (
                    <div key={group.key} className="mb-6">
                        <button
                            onClick={() => toggleGroup(group.key)}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 hover:text-slate-300 transition-colors"
                        >
                            <span className="text-[10px]">{collapsedGroups.has(group.key) ? '▶' : '▼'}</span>
                            {group.label}
                            <span className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${group.color}`}>
                                {items.length}
                            </span>
                        </button>
                        {!collapsedGroups.has(group.key) && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map(t => (
                                <div key={t.id} className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 overflow-hidden hover:shadow-md hover:-translate-y-0.5">
                                    {t.latitude && t.longitude && (
                                        <iframe
                                            title={`Locatie ${t.name}`}
                                            width="100%"
                                            height="140"
                                            className="border-b border-slate-800 pointer-events-none"
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${t.longitude - 0.01},${t.latitude - 0.01},${parseFloat(t.longitude) + 0.01},${parseFloat(t.latitude) + 0.01}&layer=mapnik&marker=${t.latitude},${t.longitude}`}
                                        />
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TournamentStepper status={t.status} compact />
                                        </div>
                                        <p className="font-semibold text-white">{t.name}</p>
                                        <p className="text-sm text-slate-400 mt-1">{formatDate(t.tournament_date)}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                        </p>
                                        {t.attachments && t.attachments.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {t.attachments.map(att => (
                                                    <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                                                        className="text-xs text-rose-400 hover:underline">
                                                        {att.original_name}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                                            className="mt-2 text-xs font-medium text-rose-400 hover:text-rose-300"
                                        >
                                            Deelnemers ({t.participants.length}) {expandedId === t.id ? '▲' : '▼'}
                                        </button>
                                        {expandedId === t.id && (
                                            <div className="mt-2 pt-2 border-t border-slate-800">
                                                {t.participants.length === 0 ? (
                                                    <p className="text-xs text-slate-500">Nog geen bevestigde deelnemers.</p>
                                                ) : (
                                                    <ul className="space-y-1">
                                                        {t.participants.map(p => (
                                                            <li key={p.id} className="flex items-center justify-between text-xs text-slate-300">
                                                                <span>{p.name}</span>
                                                                {p.result && (
                                                                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${p.result === '1e plaats' ? 'bg-yellow-900/40 text-yellow-400' :
                                                                        p.result === '2e plaats' ? 'bg-slate-600 text-slate-200' :
                                                                            p.result === '3e plaats' ? 'bg-amber-900/40 text-amber-400' :
                                                                                'bg-slate-700 text-slate-300'
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
                        </div>}
                    </div>
                );
            })}
        </div>
    );
}
