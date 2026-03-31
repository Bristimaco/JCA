import { Head, Link } from '@inertiajs/react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function EventRegistrations({ event, registrations }) {
    const { flash } = usePage().props;

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('nl-BE') : '-';
    const fmtDateTime = (d) => d ? new Date(d).toLocaleString('nl-BE') : '-';

    const totals = registrations.reduce((acc, r) => ({
        adults: acc.adults + r.adult_count,
        children: acc.children + r.child_count,
        amount: acc.amount + Number(r.total_amount),
        paid: acc.paid + (r.payment_status === 'paid' ? 1 : 0),
    }), { adults: 0, children: 0, amount: 0, paid: 0 });

    return (
        <AppLayout>
            <Head title={`Inschrijvingen — ${event.name}`} />
            <div className="mb-6">
                <Link href="/admin/evenementen" className="text-sm text-rose-400 hover:text-rose-300 mb-2 inline-block">← Terug naar evenementen</Link>
                <h1 className="text-2xl font-bold text-white">{event.name}</h1>
                <p className="text-sm text-slate-400 mt-1">Inschrijvingen — {fmtDate(event.event_date)}</p>
            </div>

            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                {flash.status && (
                    <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 ring-1 ring-emerald-700/30 p-3">
                        <p className="text-sm text-emerald-400">{flash.status}</p>
                    </div>
                )}

                <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap gap-4 text-sm">
                    <span className="text-slate-400">Totaal: <span className="font-semibold text-white">{registrations.length}</span></span>
                    <span className="text-slate-400">Betaald: <span className="font-semibold text-emerald-400">{totals.paid}</span></span>
                    <span className="text-slate-400">Volwassenen: <span className="font-semibold text-white">{totals.adults}</span></span>
                    <span className="text-slate-400">Kinderen: <span className="font-semibold text-white">{totals.children}</span></span>
                    <span className="text-slate-400">Bedrag: <span className="font-semibold text-white">€{totals.amount.toFixed(2)}</span></span>
                </div>

                {registrations.length === 0 ? (
                    <div className="px-6 py-8 text-center text-slate-500">Nog geen inschrijvingen.</div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {registrations.map((r) => (
                            <div key={r.id} className="px-6 py-3 flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{r.user_name}</p>
                                    <p className="text-xs text-slate-500">{r.user_email}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-slate-400">{r.adult_count} volw. + {r.child_count} kind.</span>
                                    <span className="font-medium text-white">€{Number(r.total_amount).toFixed(2)}</span>
                                    {r.payment_status === 'paid' ? (
                                        <span className="inline-flex items-center rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">Betaald</span>
                                    ) : r.payment_status === 'open' ? (
                                        <span className="inline-flex items-center rounded-full bg-blue-900/40 px-2.5 py-0.5 text-xs font-semibold text-blue-400">Ingeschreven</span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center rounded-full bg-amber-900/40 px-2.5 py-0.5 text-xs font-semibold text-amber-400">{r.payment_status === 'expired' ? 'Verlopen' : 'In afwachting'}</span>
                                            {r.mollie_payment_url && (
                                                <button onClick={() => { navigator.clipboard.writeText(r.mollie_payment_url); }} className="rounded-lg bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-600">Link kopiëren</button>
                                            )}
                                            <button
                                                onClick={() => router.post(`/admin/evenementen/${event.id}/registrations/${r.id}/mark-paid`, {}, { preserveScroll: true })}
                                                className="rounded-lg bg-emerald-900/30 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-900/50 ring-1 ring-emerald-700/30"
                                            >
                                                Betaald markeren
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
