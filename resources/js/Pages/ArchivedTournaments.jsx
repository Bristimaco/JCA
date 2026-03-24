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
                result === '2e plaats' ? 'bg-gray-200 text-gray-800' :
                    result === '3e plaats' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-600';
        return (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}>
                {result}
            </span>
        );
    };

    return (
        <AppLayout>
            <Head title="Archief" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Gearchiveerde Toernooien</h1>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                    {tournaments.length}
                </span>
            </div>

            {tournaments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-12 text-center text-gray-500">
                    Nog geen gearchiveerde toernooien.
                </div>
            ) : (
                <div className="space-y-4">
                    {tournaments.map(t => (
                        <div key={t.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-5 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-lg font-semibold text-gray-900">{t.name}</h2>
                                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                                Gearchiveerd
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{formatDate(t.tournament_date)}</p>
                                        <p className="text-sm text-gray-500">
                                            {[t.address_street, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                            {' · '}{t.country_code}
                                        </p>
                                        {t.coaches.length > 0 && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Trainers: {t.coaches.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/toernooien/${t.id}`}
                                            className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                                        >
                                            Detail bekijken
                                        </Link>
                                        <button
                                            onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Resultaten ({t.results.length}) {expandedId === t.id ? '▲' : '▼'}
                                        </button>
                                    </div>
                                </div>

                                {t.attachments.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {t.attachments.map(att => (
                                            <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center rounded bg-gray-50 px-2 py-1 text-xs text-blue-600 hover:underline border border-gray-200">
                                                {att.original_name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {expandedId === t.id && (
                                <div className="border-t border-gray-200 px-5 py-4 bg-gray-50">
                                    {t.results.length === 0 ? (
                                        <p className="text-sm text-gray-500">Geen resultaten beschikbaar.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {t.results.map((r, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700">{r.member_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        {resultBadge(r.result)}
                                                        {r.notes && (
                                                            <span className="text-xs text-gray-400 max-w-[200px] truncate" title={r.notes}>
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
