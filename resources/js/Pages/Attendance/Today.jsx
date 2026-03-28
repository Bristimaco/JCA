import { Head, Link, router } from '@inertiajs/react';

export default function Today({ sessions }) {
    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <Head title="Aanwezigheid - Vandaag" />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Actieve Trainingen</h1>
                        <p className="text-slate-400 mt-1">{new Date().toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.reload()}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700"
                        >
                            Vernieuwen
                        </button>
                        <button
                            onClick={() => router.post('/attendance/logout')}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-red-400 hover:bg-slate-700 ring-1 ring-slate-700"
                        >
                            Afmelden
                        </button>
                    </div>
                </div>

                {(!sessions || sessions.length === 0) ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-lg text-slate-400">Geen actieve trainingen op dit moment</p>
                        <p className="text-sm text-slate-500 mt-1">Een trainer moet eerst een training openen</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sessions.map((s) => (
                            <Link
                                key={s.id}
                                href={`/attendance/session/${s.id}`}
                                className="group bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-emerald-600/60 p-6 hover:shadow-md hover:ring-emerald-500/40 hover:-translate-y-0.5 transition-all"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Open</span>
                                </div>
                                <p className="text-lg font-bold text-white">{s.group_name}</p>
                                <p className="text-sm text-slate-400 mt-1">{s.day} {s.start_time}{s.end_time ? `–${s.end_time}` : ''}</p>
                                {s.trainer_name && <p className="text-xs text-slate-500 mt-1">Trainer: {s.trainer_name}</p>}
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-sm font-medium text-slate-300">
                                        {s.attendance_count} aanwezig
                                    </span>
                                    <span className="text-xs font-medium text-rose-400 group-hover:text-rose-300">Registreren →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
