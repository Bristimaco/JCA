import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import StageStepper from '../Components/StageStepper';

export default function ArchivedStages({ stages }) {
    const { auth } = usePage().props;
    const isAdmin = auth.user?.role === 'admin';

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <AppLayout>
            <Head title="Stage Archief" />

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-stone-100 tracking-tight">Gearchiveerde Stages</h1>
                    <span className="inline-flex items-center rounded-full bg-teal-900/40 px-2.5 py-0.5 text-xs font-semibold text-teal-400">
                        {stages.length}
                    </span>
                </div>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                    ← Dashboard
                </Link>
            </div>

            {stages.length === 0 ? (
                <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-teal-700/40 px-6 py-12 text-center text-slate-400">
                    <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                    Nog geen gearchiveerde stages.
                </div>
            ) : (
                <div className="space-y-4">
                    {stages.map(s => (
                        <div key={s.id} className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-teal-700/40 overflow-hidden hover:shadow-md">
                            <div className="px-5 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-lg font-semibold text-white">{s.name}</h2>
                                            <StageStepper status="archived" compact />
                                        </div>
                                        <p className="text-sm text-slate-500">Van: {formatDate(s.start_date)}</p>
                                        <p className="text-sm text-slate-500">Tot: {formatDate(s.end_date)}</p>
                                        <p className="text-sm text-slate-500">
                                            {[s.address_street, s.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                            {' · '}{s.country_code}
                                        </p>
                                        {s.coaches.length > 0 && (
                                            <p className="text-sm text-slate-500 mt-1">
                                                Trainers: {s.coaches.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/stages/${s.id}`}
                                            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                                        >
                                            Detail bekijken
                                        </Link>
                                        {isAdmin && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Weet je zeker dat je deze stage wilt verwijderen? Alle deelnemers en bijlagen worden permanent verwijderd.')) {
                                                        router.delete(`/archief/stages/${s.id}`, { preserveScroll: true });
                                                    }
                                                }}
                                                className="rounded-lg px-2 py-1.5 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
                                                title="Stage verwijderen"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {s.attachments.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {s.attachments.map(att => (
                                            <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center rounded-lg bg-slate-800/50 px-2.5 py-1 text-xs text-teal-400 hover:underline ring-1 ring-slate-800">
                                                {att.original_name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
