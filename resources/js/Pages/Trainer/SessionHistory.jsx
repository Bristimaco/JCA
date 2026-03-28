import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function SessionHistory({ sessions }) {
    const [expandedId, setExpandedId] = useState(null);

    return (
        <AppLayout>
            <Head title="Trainingshistoriek" />
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">Trainingshistoriek</h1>
                    <Link href="/" className="text-sm font-medium text-rose-400 hover:text-rose-300">
                        ← Dashboard
                    </Link>
                </div>

                {sessions.length === 0 ? (
                    <div className="bg-slate-900 rounded-xl p-8 text-center ring-1 ring-slate-800">
                        <p className="text-slate-400">Nog geen afgesloten trainingen.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sessions.map(s => (
                            <div key={s.id} className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                                    className="w-full p-4 text-left hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-semibold text-white">{s.group_name}</p>
                                                <p className="text-sm text-slate-400">
                                                    {s.day} {new Date(s.date).toLocaleDateString('nl-BE')} &middot; {s.start_time}{s.end_time ? `–${s.end_time}` : ''}
                                                    {s.trainer_name && <span className="ml-1 text-slate-500">({s.trainer_name})</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                                                {s.attendance_count} {s.attendance_count === 1 ? 'deelnemer' : 'deelnemers'}
                                            </span>
                                            <span className="text-slate-500 text-sm">
                                                {expandedId === s.id ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>
                                </button>

                                {expandedId === s.id && (
                                    <div className="px-4 pb-4 border-t border-slate-800">
                                        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                            <span>Geopend: {s.opened_at}</span>
                                            <span>Afgesloten: {s.closed_at}</span>
                                        </div>

                                        {s.remarks && (
                                            <div className="mt-3 p-3 rounded-lg bg-slate-800/50 ring-1 ring-slate-700/50">
                                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Opmerking</p>
                                                <p className="text-sm text-slate-300">{s.remarks}</p>
                                            </div>
                                        )}

                                        <div className="mt-3">
                                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Aanwezig ({s.attendees.length})</p>
                                            {s.attendees.length === 0 ? (
                                                <p className="text-xs text-slate-500">Geen deelnemers geregistreerd.</p>
                                            ) : (
                                                <div className="grid gap-1">
                                                    {s.attendees.map((a, i) => (
                                                        <div key={i} className="flex items-center justify-between text-sm">
                                                            <span className="text-emerald-400">{a.name}</span>
                                                            <span className="text-xs text-slate-500">{a.confirmed_at}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {s.absentees && s.absentees.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Afwezig ({s.absentees.length})</p>
                                                <div className="grid gap-1">
                                                    {s.absentees.map((a, i) => (
                                                        <div key={i} className="text-sm">
                                                            <span className="text-red-400/70">{a.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
