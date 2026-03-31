import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function Register({ event, existingRegistration }) {
    const { flash } = usePage().props;
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('nl-BE') : '-';

    const form = useForm({
        adult_count: existingRegistration?.adult_count || 1,
        child_count: existingRegistration?.child_count || 0,
    });

    const total = (form.data.adult_count * event.price_adult) + (form.data.child_count * event.price_child);

    const isPaid = existingRegistration?.payment_status === 'paid';

    const submit = (e) => {
        e.preventDefault();
        form.post(`/evenementen/${event.id}/inschrijven`);
    };

    return (
        <AppLayout>
            <Head title={`Inschrijven — ${event.name}`} />

            <div className="max-w-lg mx-auto">
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                    {event.has_image && (
                        <img src={`/event-afbeelding/${event.id}`} alt={event.name} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-white">{event.name}</h1>
                        <p className="text-sm text-slate-400 mt-1">📅 {fmtDate(event.event_date)}{event.event_time ? ` om ${event.event_time}` : ''}</p>
                        {(event.address_street || event.address_city) && (
                            <p className="text-sm text-slate-500 mt-1">📍 {[event.address_street, event.address_postal_code, event.address_city].filter(Boolean).join(', ')}</p>
                        )}
                        {event.description && <p className="text-sm text-slate-400 mt-3">{event.description}</p>}

                        <div className="mt-4 p-3 rounded-lg bg-slate-800/50 ring-1 ring-slate-700/50">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Prijs volwassene</span>
                                <span className="text-white font-medium">€{Number(event.price_adult).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-slate-400">Prijs kind</span>
                                <span className="text-white font-medium">€{Number(event.price_child).toFixed(2)}</span>
                            </div>
                        </div>

                        {isPaid ? (
                            <div className="mt-6 rounded-lg bg-emerald-900/30 ring-1 ring-emerald-700/30 px-4 py-3 text-center">
                                <p className="text-emerald-400 font-semibold">✓ Je bent ingeschreven!</p>
                                <p className="text-sm text-slate-400 mt-1">
                                    {existingRegistration.adult_count} volwassene(n) + {existingRegistration.child_count} kind(eren) — €{Number(existingRegistration.total_amount).toFixed(2)}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={submit} className="mt-6">
                                {existingRegistration && existingRegistration.payment_status === 'pending' && existingRegistration.payment_url && (
                                    <div className="mb-4 rounded-lg bg-amber-900/30 ring-1 ring-amber-700/30 px-4 py-3">
                                        <p className="text-sm text-amber-400">Je hebt al een inschrijving, maar de betaling is nog niet afgerond.</p>
                                        <a href={existingRegistration.payment_url} className="mt-2 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">Betaling voltooien</a>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Aantal volwassenen</label>
                                        <input type="number" min="0" max="20" value={form.data.adult_count} onChange={e => form.setData('adult_count', parseInt(e.target.value) || 0)} className="w-full rounded-lg bg-slate-800 text-white text-sm px-3 py-2.5 ring-1 ring-slate-700 focus:ring-rose-500 focus:outline-none" />
                                        {form.errors.adult_count && <p className="text-xs text-red-400 mt-1">{form.errors.adult_count}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Aantal kinderen</label>
                                        <input type="number" min="0" max="20" value={form.data.child_count} onChange={e => form.setData('child_count', parseInt(e.target.value) || 0)} className="w-full rounded-lg bg-slate-800 text-white text-sm px-3 py-2.5 ring-1 ring-slate-700 focus:ring-rose-500 focus:outline-none" />
                                        {form.errors.child_count && <p className="text-xs text-red-400 mt-1">{form.errors.child_count}</p>}
                                    </div>
                                </div>

                                <div className="mt-4 p-3 rounded-lg bg-rose-900/20 ring-1 ring-rose-700/30">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-medium text-slate-300">Totaal te betalen</span>
                                        <span className="text-lg font-bold text-rose-400">€{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {flash.status && (
                                    <div className="mt-3 rounded-md bg-emerald-900/30 ring-1 ring-emerald-700/30 p-3">
                                        <p className="text-sm text-emerald-400">{flash.status}</p>
                                    </div>
                                )}

                                <button type="submit" disabled={form.processing || total <= 0} className="mt-4 w-full rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors">
                                    {total > 0 ? `Betalen — €${total.toFixed(2)}` : 'Inschrijven'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
