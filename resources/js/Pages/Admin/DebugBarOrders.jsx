import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

const STATUSES = [
    { key: '', label: 'Alle statussen' },
    { key: 'pending', label: 'Pending' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'paid', label: 'Paid' },
    { key: 'poef', label: 'Poef' },
];

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(val) {
    return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(val);
}

const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    preparing: 'bg-blue-500/20 text-blue-400',
    ready: 'bg-emerald-500/20 text-emerald-400',
    paid: 'bg-green-500/20 text-green-400',
    poef: 'bg-orange-500/20 text-orange-400',
};

export default function DebugBarOrders({ orders, status }) {
    const { flash } = usePage().props;
    const [expanded, setExpanded] = useState({});
    const [deleteId, setDeleteId] = useState(null);

    const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    const handleFilter = (s) => {
        router.get('/admin/debug/bestellingen', s ? { status: s } : {}, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deleteId) return;
        router.delete(`/admin/debug/bestellingen/${deleteId}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Debug — Bestellingen" />

            <div className="mb-6 flex items-center gap-3">
                <Link href="/admin/debug" className="text-slate-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </Link>
                <h1 className="text-2xl font-bold text-white">Bestellingen</h1>
                <span className="text-sm text-slate-400">({orders.total})</span>
            </div>

            {flash?.status && (
                <div className="mb-4 rounded-lg bg-emerald-900/50 border border-emerald-700/50 p-4">
                    <p className="text-sm text-emerald-300">{flash.status}</p>
                </div>
            )}

            {/* Filter */}
            <div className="mb-4">
                <select
                    value={status}
                    onChange={(e) => handleFilter(e.target.value)}
                    className="rounded-lg bg-slate-800 text-white border-slate-700 text-sm px-3 py-2"
                >
                    {STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                </select>
            </div>

            {/* Order List */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                {orders.data.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500">Geen bestellingen gevonden.</div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {/* Header */}
                        <div className="hidden sm:grid items-center px-4 py-2 text-xs text-slate-500 font-medium border-b border-slate-800" style={{ gridTemplateColumns: '24px 48px 72px 88px 1fr 1fr 152px 32px' }}>
                            <span />
                            <span>#</span>
                            <span>Status</span>
                            <span>Bedrag</span>
                            <span>Betaald via</span>
                            <span>Gebruiker</span>
                            <span className="text-right">Datum</span>
                            <span />
                        </div>
                        {orders.data.map((order) => (
                            <div key={order.id}>
                                <div
                                    className="flex sm:grid items-center gap-2 sm:gap-0 px-4 py-3 hover:bg-slate-800/50 cursor-pointer"
                                    style={{ gridTemplateColumns: '24px 48px 72px 88px 1fr 1fr 152px 32px' }}
                                    onClick={() => toggle(order.id)}
                                >
                                    <svg className={`w-4 h-4 text-slate-500 transition-transform ${expanded[order.id] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    <span className="text-xs text-slate-500 font-mono">#{order.id}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${statusColors[order.status] || 'bg-slate-700 text-slate-300'}`}>
                                        {order.status}
                                    </span>
                                    <span className="text-sm text-white font-medium">{formatCurrency(order.total)}</span>
                                    <span className="text-xs text-slate-400 hidden sm:inline truncate">{order.payment_method || '-'}</span>
                                    <span className="text-xs text-slate-400 hidden sm:inline truncate">
                                        {order.ordered_by?.name || order.user?.name || '-'}
                                    </span>
                                    <span className="text-xs text-slate-500 hidden sm:inline text-right">{formatDate(order.created_at)}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteId(order.id); }}
                                        className="text-slate-500 hover:text-red-400 shrink-0 justify-self-end sm:justify-self-auto"
                                        title="Verwijderen"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>

                                {expanded[order.id] && (
                                    <div className="px-4 pb-3 pl-14">
                                        <div className="sm:hidden text-xs text-slate-500 mb-2 space-y-0.5">
                                            <div>{order.ordered_by?.name || order.user?.name || '-'} — {formatDate(order.created_at)}</div>
                                            <div>Betaald via: {order.payment_method || '-'}</div>
                                        </div>
                                        {order.payment_status && order.payment_status !== order.status && (
                                            <p className="text-xs text-slate-500 mb-2">Betaalstatus: {order.payment_status}</p>
                                        )}
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="text-slate-500">
                                                    <th className="text-left py-1">Product</th>
                                                    <th className="text-right py-1">Aantal</th>
                                                    <th className="text-right py-1">Stukprijs</th>
                                                    <th className="text-right py-1">Subtotaal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items?.map((item) => (
                                                    <tr key={item.id} className="text-slate-300">
                                                        <td className="py-1">{item.product?.name || 'Verwijderd'}</td>
                                                        <td className="text-right py-1">{item.quantity}</td>
                                                        <td className="text-right py-1">{formatCurrency(item.unit_price)}</td>
                                                        <td className="text-right py-1">{formatCurrency(item.quantity * item.unit_price)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {orders.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {orders.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`px-3 py-1 rounded text-sm ${
                                link.active ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setDeleteId(null)}>
                    <div className="bg-slate-900 rounded-xl ring-1 ring-slate-700 p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-2">Bestelling verwijderen?</h3>
                        <p className="text-sm text-slate-400 mb-6">
                            Bestelling #{deleteId} en alle bijhorende items worden permanent verwijderd. Dit heeft invloed op de verkoopstatistieken.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700">
                                Annuleren
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500">
                                Verwijderen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
