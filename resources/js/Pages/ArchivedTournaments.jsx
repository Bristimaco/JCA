import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import { useState } from 'react';
import TournamentStepper from '../Components/TournamentStepper';

export default function ArchivedTournaments({ tournaments }) {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';
    const [expandedId, setExpandedId] = useState(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const resultBadge = (result) => {
        const map = {
            '1e plaats': { icon: '🥇', colors: 'bg-yellow-900/40 text-yellow-400' },
            '2e plaats': { icon: '🥈', colors: 'bg-slate-600 text-slate-200' },
            '3e plaats': { icon: '🥉', colors: 'bg-amber-900/40 text-amber-300' },
            '5e plaats': { icon: '5', colors: 'bg-sky-900/40 text-sky-400' },
            '7e plaats': { icon: '7', colors: 'bg-indigo-900/40 text-indigo-400' },
            'Deelgenomen': { icon: '✓', colors: 'bg-emerald-900/40 text-emerald-400' },
            'Niet opgekomen': { icon: '✗', colors: 'bg-red-900/40 text-red-400' },
            'Gediskwalificeerd': { icon: '⊘', colors: 'bg-red-900/40 text-red-400' },
        };
        const entry = map[result] || { icon: '·', colors: 'bg-slate-700 text-slate-400' };
        return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${entry.colors}`}>
                <span>{entry.icon}</span> {result}
            </span>
        );
    };

    return (
        <AppLayout>
            <Head title="Archief" />

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-stone-100 tracking-tight">Gearchiveerde Toernooien</h1>
                    <span className="inline-flex items-center rounded-full bg-purple-900/40 px-2.5 py-0.5 text-xs font-semibold text-purple-400">
                        {tournaments.length}
                    </span>
                </div>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                    ← Dashboard
                </Link>
            </div>

            {tournaments.length === 0 ? (
                <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-rose-700/40 px-6 py-12 text-center text-slate-400">
                    <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                    Nog geen gearchiveerde toernooien.
                </div>
            ) : (
                <div className="space-y-4">
                    {tournaments.map(t => (
                        <div key={t.id} className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-rose-700/40 overflow-hidden hover:shadow-md">
                            <div className="px-5 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-lg font-semibold text-white">{t.name}</h2>
                                            <TournamentStepper status={t.status || 'archived'} compact />
                                        </div>
                                        <p className="text-sm text-slate-500">{formatDate(t.tournament_date)}</p>
                                        <p className="text-sm text-slate-500">
                                            {[t.address_street, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                            {' · '}{t.country_code}
                                        </p>
                                        {t.coaches.length > 0 && (
                                            <p className="text-sm text-slate-500 mt-1">
                                                Trainers: {t.coaches.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/toernooien/${t.id}`}
                                            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                                        >
                                            Detail bekijken
                                        </Link>
                                        <button
                                            onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-400 hover:bg-rose-900/30"
                                        >
                                            Resultaten ({t.results.length}) {expandedId === t.id ? '▲' : '▼'}
                                        </button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Weet je zeker dat je dit toernooi wilt verwijderen? Alle resultaten, deelnemers en podiumfoto\'s worden permanent verwijderd.')) {
                                                        router.delete(`/archief/${t.id}`, { preserveScroll: true });
                                                    }
                                                }}
                                                className="rounded-lg px-2 py-1.5 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
                                                title="Toernooi verwijderen"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {t.attachments.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {t.attachments.map(att => (
                                            <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center rounded-lg bg-slate-800/50 px-2.5 py-1 text-xs text-rose-400 hover:underline ring-1 ring-slate-800">
                                                {att.original_name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {expandedId === t.id && (
                                <div className="border-t border-slate-800 bg-slate-800/30">
                                    {t.results.length === 0 ? (
                                        <p className="px-5 py-4 text-sm text-slate-500">Geen resultaten beschikbaar.</p>
                                    ) : (
                                        <>
                                        {/* Desktop table */}
                                        <div className="hidden lg:block overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-slate-700/50">
                                                        <th className="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Naam</th>
                                                        <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Resultaat</th>
                                                        <th className="px-5 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Opmerking</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {t.results.map((r, idx) => (
                                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-800/20' : ''}>
                                                            <td className="px-5 py-2.5 text-slate-300 font-medium">{r.member_name}</td>
                                                            <td className="px-3 py-2.5">{resultBadge(r.result)}</td>
                                                            <td className="px-5 py-2.5 text-xs text-slate-400 italic">{r.notes || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile cards */}
                                        <div className="lg:hidden divide-y divide-slate-700/50">
                                            {t.results.map((r, idx) => (
                                                <div key={idx} className="px-4 py-2.5 flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-slate-300 font-medium truncate">{r.member_name}</p>
                                                        {r.notes && <p className="text-xs text-slate-400 italic truncate">{r.notes}</p>}
                                                    </div>
                                                    <div className="shrink-0">{resultBadge(r.result)}</div>
                                                </div>
                                            ))}
                                        </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
