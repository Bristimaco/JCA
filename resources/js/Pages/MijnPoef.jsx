import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';

export default function MijnPoef({ orders, total }) {
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' }) + ' ' +
            d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AppLayout>
            <Head title="Mijn Poef" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-300">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white tracking-tight">Mijn Poef</h1>
                <span className="ml-auto text-lg font-bold text-amber-400">€{Number(total).toFixed(2)}</span>
            </div>

            <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-700/60 border-t-2 border-t-rose-700">
                {orders.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500">
                        <svg className="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Geen openstaande poef.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {orders.map((order) => (
                            <div key={order.id} className="px-6 py-4 hover:bg-slate-700/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400">#{order.id} — {formatDate(order.created_at)}</span>
                                    <span className="text-sm font-semibold text-white">€{Number(order.total).toFixed(2)}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {order.items.map((item) => (
                                        <span key={item.id} className="rounded bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-300">
                                            {item.product_name} ×{item.quantity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {orders.length > 0 && (
                <p className="mt-4 text-xs text-slate-500 text-center">
                    Betaling verloopt via de barmedewerker.
                </p>
            )}
        </AppLayout>
    );
}
