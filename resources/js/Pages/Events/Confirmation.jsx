import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function Confirmation({ event, registration }) {
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('nl-BE') : '-';
    const isPaid = registration.payment_status === 'paid';

    return (
        <AppLayout>
            <Head title={`Bevestiging — ${event.name}`} />

            <div className="max-w-lg mx-auto">
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden p-6 text-center">
                    {isPaid ? (
                        <>
                            <div className="w-16 h-16 rounded-full bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Inschrijving bevestigd!</h1>
                            <p className="text-slate-400 mt-2">Je betaling voor <span className="text-white font-medium">{event.name}</span> is ontvangen.</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-full bg-amber-900/40 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Wachten op betaling</h1>
                            <p className="text-slate-400 mt-2">We wachten nog op de bevestiging van je betaling voor <span className="text-white font-medium">{event.name}</span>.</p>
                            {registration.payment_url && (
                                <a href={registration.payment_url} className="mt-4 inline-block rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Betaling voltooien</a>
                            )}
                        </>
                    )}

                    <div className="mt-6 p-3 rounded-lg bg-slate-800/50 ring-1 ring-slate-700/50 text-left">
                        <p className="text-sm text-slate-400">📅 {fmtDate(event.event_date)}{event.event_time ? ` om ${event.event_time}` : ''}</p>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-slate-400">{registration.adult_count} volwassene(n) + {registration.child_count} kind(eren)</span>
                            <span className="font-medium text-white">€{Number(registration.total_amount).toFixed(2)}</span>
                        </div>
                    </div>

                    <Link href="/evenementen" className="mt-6 inline-block text-sm text-rose-400 hover:text-rose-300 font-medium">
                        ← Terug naar evenementen
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
