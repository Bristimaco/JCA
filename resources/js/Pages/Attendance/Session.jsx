import { Head, Link, router } from '@inertiajs/react';

export default function Session({ session, members }) {
    const handleToggle = (memberId) => {
        router.post(`/attendance/session/${session.id}/toggle/${memberId}`, {}, {
            preserveScroll: true,
        });
    };

    const attendingCount = members.filter((m) => m.attending).length;

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <Head title={`Aanwezigheid - ${session.group_name}`} />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link
                            href="/attendance/today"
                            className="text-sm text-slate-400 hover:text-slate-300 mb-2 inline-block"
                        >
                            ← Terug naar overzicht
                        </Link>
                        <h1 className="text-2xl font-bold text-white">{session.group_name}</h1>
                        <p className="text-slate-400 mt-1">
                            {session.day} {session.start_time}{session.end_time ? `–${session.end_time}` : ''}
                            {session.trainer_name && ` • ${session.trainer_name}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="inline-flex items-center rounded-full bg-emerald-900/40 px-3 py-1 text-sm font-semibold text-emerald-400">
                            {attendingCount} / {members.length}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {members.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => handleToggle(m.id)}
                            className={`rounded-xl p-4 text-center transition-all active:scale-95 ${
                                m.attending
                                    ? 'bg-emerald-900/40 ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-900/20'
                                    : 'bg-slate-900 ring-1 ring-slate-700 hover:ring-slate-600'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold ${
                                m.attending
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-700 text-slate-400'
                            }`}>
                                {m.attending ? '✓' : m.name.charAt(0)}
                            </div>
                            <p className={`text-sm font-medium truncate ${
                                m.attending ? 'text-emerald-300' : 'text-slate-300'
                            }`}>
                                {m.name}
                            </p>
                        </button>
                    ))}
                </div>

                {members.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-lg text-slate-400">Geen leden in deze trainingsgroep</p>
                    </div>
                )}
            </div>
        </div>
    );
}
