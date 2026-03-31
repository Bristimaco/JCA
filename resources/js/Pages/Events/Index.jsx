import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function Index({ events }) {
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('nl-BE') : '-';

    return (
        <AppLayout>
            <Head title="Evenementen" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Evenementen</h1>
                <p className="text-sm text-slate-400 mt-1">Bekijk en schrijf je in voor evenementen</p>
            </div>

            {events.length === 0 ? (
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 px-6 py-12 text-center text-slate-500">
                    Er zijn momenteel geen evenementen.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((ev) => (
                        <div key={ev.id} className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden hover:ring-rose-500/30 transition-all">
                            {ev.has_image && (
                                <img src={`/event-afbeelding/${ev.id}`} alt={ev.name} className="w-full h-40 object-cover" />
                            )}
                            <div className="p-4">
                                <h2 className="font-semibold text-white text-lg">{ev.name}</h2>
                                <p className="text-sm text-slate-400 mt-1">📅 {fmtDate(ev.event_date)}{ev.event_time ? ` om ${ev.event_time}` : ''}</p>
                                {(ev.address_street || ev.address_city) && (
                                    <p className="text-xs text-slate-500 mt-1">📍 {[ev.address_street, ev.address_postal_code, ev.address_city].filter(Boolean).join(', ')}</p>
                                )}
                                {ev.description && <p className="text-sm text-slate-400 mt-2 line-clamp-2">{ev.description}</p>}
                                <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                                    <span>Volwassene: €{Number(ev.price_adult).toFixed(2)}</span>
                                    <span>Kind: €{Number(ev.price_child).toFixed(2)}</span>
                                </div>

                                {ev.my_registration && ev.my_registration.payment_status === 'paid' ? (
                                    <div className="mt-3 rounded-lg bg-emerald-900/30 ring-1 ring-emerald-700/30 px-3 py-2 text-sm text-emerald-400 font-medium">
                                        ✓ Ingeschreven ({ev.my_registration.adult_count} volw. + {ev.my_registration.child_count} kind.)
                                    </div>
                                ) : (
                                    <Link href={`/evenementen/${ev.id}/inschrijven`} className="mt-3 block text-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors">
                                        Inschrijven
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
