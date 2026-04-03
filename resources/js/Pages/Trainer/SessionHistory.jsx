import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function SessionHistory({ sessions }) {
    const [expandedId, setExpandedId] = useState(null);
    const [selectedTrainer, setSelectedTrainer] = useState(null);

    const trainers = [...new Set(sessions.map(s => s.trainer_name).filter(Boolean))].sort();
    const filtered = selectedTrainer ? sessions.filter(s => s.trainer_name === selectedTrainer) : sessions;

    return (
        <AppLayout>
            <Head title="Trainingshistoriek" />
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">Trainingshistoriek</h1>
                    <div className="flex items-center gap-4">
                        <Link href="/trainer/attendance-report" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                            Aanwezigheidsrapport
                        </Link>
                        <Link href="/" className="text-sm font-medium text-rose-400 hover:text-rose-300">
                            ← Dashboard
                        </Link>
                    </div>
                </div>

                {trainers.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setSelectedTrainer(null)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!selectedTrainer ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 ring-1 ring-slate-700'}`}
                        >
                            Alle
                        </button>
                        {trainers.map(t => (
                            <button
                                key={t}
                                onClick={() => setSelectedTrainer(selectedTrainer === t ? null : t)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${selectedTrainer === t ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 ring-1 ring-slate-700'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}

                {filtered.length === 0 ? (
                    <div className="bg-slate-900 rounded-xl p-8 text-center ring-1 ring-slate-800">
                        <p className="text-slate-400">Nog geen afgesloten trainingen.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(s => (
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

                                        {s.external_attendees && s.external_attendees.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Andere clubs ({s.external_attendees.length})</p>
                                                <div className="grid gap-1">
                                                    {s.external_attendees.map((a, i) => (
                                                        <div key={i} className="flex items-center justify-between text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-purple-400">{a.name}</span>
                                                                <span className="text-[10px] text-purple-600/70 bg-purple-900/20 px-1.5 py-0.5 rounded">{a.club_name}</span>
                                                            </div>
                                                            <span className="text-xs text-slate-500">{a.confirmed_at}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {s.absentees && s.absentees.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Afwezig ({s.absentees.length})</p>
                                                <div className="grid gap-1">
                                                    {s.absentees.map((a, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-sm">
                                                            <span className={a.notified ? 'text-amber-400/80' : 'text-red-400/70'}>{a.name}</span>
                                                            {a.notified && <span className="text-[10px] text-amber-600/70 bg-amber-900/20 px-1.5 py-0.5 rounded">gemeld</span>}
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
