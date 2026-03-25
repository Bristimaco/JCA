import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import { useState } from 'react';

export default function ArchivedTournaments({ tournaments }) {
    const [expandedId, setExpandedId] = useState(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const resultBadge = (result) => {
        const colors =
            result === '1e plaats' ? 'bg-yellow-100 text-yellow-800' :
                result === '2e plaats' ? 'bg-slate-200 text-slate-800' :
                    result === '3e plaats' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600';
        return (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colors}`}>
                {result}
            </span>
        );
    };

    return (
        <AppLayout>
            <Head title="Archief" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-600">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gearchiveerde Toernooien</h1>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                    {tournaments.length}
                </span>
            </div>

            {tournaments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/60 px-6 py-12 text-center text-slate-400">
                    <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                    Nog geen gearchiveerde toernooien.
                </div>
            ) : (
                <div className="space-y-4">
                    {tournaments.map(t => (
                        <div key={t.id} className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden hover:shadow-md">
                            <div className="px-5 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-lg font-semibold text-slate-900">{t.name}</h2>
                                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                                                Gearchiveerd
                                            </span>
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
                                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                                        >
                                            Detail bekijken
                                        </Link>
                                        <button
                                            onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                                            className="rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                                        >
                                            Resultaten ({t.results.length}) {expandedId === t.id ? '▲' : '▼'}
                                        </button>
                                    </div>
                                </div>

                                {t.attachments.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {t.attachments.map(att => (
                                            <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-xs text-indigo-600 hover:underline ring-1 ring-slate-200/60">
                                                {att.original_name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {expandedId === t.id && (
                                <div className="border-t border-slate-200/60 px-5 py-4 bg-slate-50/50">
                                    {t.results.length === 0 ? (
                                        <p className="text-sm text-slate-500">Geen resultaten beschikbaar.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {t.results.map((r, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-700">{r.member_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        {resultBadge(r.result)}
                                                        {r.notes && (
                                                            <span className="text-xs text-slate-400 max-w-[200px] truncate" title={r.notes}>
                                                                {r.notes}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
