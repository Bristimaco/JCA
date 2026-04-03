import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import QrPaymentOverlay from '../../Components/QrPaymentOverlay';

export default function Poef({ poefUsers }) {
    const [qrPayment, setQrPayment] = useState(null);
    const [qrUserId, setQrUserId] = useState(null);
    const [expanded, setExpanded] = useState({});

    const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.content;

    const toggleExpanded = (userId) => {
        setExpanded((prev) => ({ ...prev, [userId]: !prev[userId] }));
    };

    const handleQrPayment = async (userId) => {
        try {
            const res = await fetch('/pos/poef/qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), Accept: 'application/json' },
                body: JSON.stringify({ user_id: userId }),
            });
            if (res.ok) {
                const data = await res.json();
                setQrPayment(data);
                setQrUserId(userId);
            }
        } catch { /* network error */ }
    };

    const handleQrPaid = () => {
        if (qrUserId && qrPayment) {
            router.post('/pos/poef/betaald', {
                user_id: qrUserId,
                payment_method: 'bancontact',
                mollie_payment_id: qrPayment.payment_id,
            }, {
                preserveScroll: true,
                onFinish: () => {
                    setQrPayment(null);
                    setQrUserId(null);
                },
            });
        }
    };

    const handlePaidOther = (userId) => {
        router.post('/pos/poef/betaald', {
            user_id: userId,
            payment_method: 'other',
        }, { preserveScroll: true });
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' }) + ' ' +
            d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
    };

    const totalPoef = poefUsers.reduce((sum, u) => sum + Number(u.total), 0);

    return (
        <AppLayout fullWidth>
            <Head title="Poef" />

            <div className="flex flex-col h-[calc(100dvh-3.5rem)] overflow-hidden p-2">
                <div className="shrink-0 flex items-center gap-4 mb-2">
                    <Link href="/pos" className="text-sm font-medium text-slate-500 hover:text-slate-300">
                        &larr; Kassa
                    </Link>
                    <h1 className="text-xl font-bold text-white tracking-tight">Poef</h1>
                    <span className="text-sm text-slate-400">{poefUsers.length} {poefUsers.length === 1 ? 'gebruiker' : 'gebruikers'}</span>
                    <span className="ml-auto text-lg font-bold text-amber-400">€{totalPoef.toFixed(2)}</span>
                    <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                        ← Dashboard
                    </Link>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-2">
                    {poefUsers.length === 0 ? (
                        <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-12 text-center text-slate-500">
                            Geen openstaande poef.
                        </div>
                    ) : (
                        poefUsers.map((entry) => (
                            <div key={entry.user_id} className="rounded-lg bg-slate-900 ring-1 ring-slate-800 p-3">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => toggleExpanded(entry.user_id)}
                                        className="flex items-center gap-2 text-left"
                                    >
                                        <span className="text-xs text-slate-500">{expanded[entry.user_id] ? '▼' : '▶'}</span>
                                        <span className="text-sm font-bold text-white">{entry.user_name}</span>
                                        <span className="text-xs text-slate-400">{entry.orders.length} {entry.orders.length === 1 ? 'bestelling' : 'bestellingen'}</span>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-amber-400">€{Number(entry.total).toFixed(2)}</span>
                                        <button
                                            onClick={() => handleQrPayment(entry.user_id)}
                                            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                                        >
                                            QR Betaling
                                        </button>
                                        <button
                                            onClick={() => handlePaidOther(entry.user_id)}
                                            className="rounded-md bg-slate-700 ring-1 ring-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600 transition-colors"
                                        >
                                            Betaald
                                        </button>
                                    </div>
                                </div>

                                {expanded[entry.user_id] && (
                                    <div className="mt-2 space-y-1.5">
                                        {entry.orders.map((order) => (
                                            <div key={order.id} className="rounded-md bg-slate-800/50 ring-1 ring-slate-700/50 px-3 py-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-slate-400">#{order.id} — {formatDate(order.created_at)}</span>
                                                    <span className="text-sm font-semibold text-white">€{Number(order.total).toFixed(2)}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {order.items.map((item) => (
                                                        <span key={item.id} className="rounded bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-300">
                                                            {item.product?.name || 'Product'} ×{item.quantity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {qrPayment && (
                <QrPaymentOverlay
                    amount={poefUsers.find((u) => u.user_id === qrUserId)?.total || 0}
                    paymentId={qrPayment.payment_id}
                    qrSrc={qrPayment.qr_src}
                    checkoutUrl={qrPayment.checkout_url}
                    onClose={() => { setQrPayment(null); setQrUserId(null); }}
                    onPaid={handleQrPaid}
                />
            )}
        </AppLayout>
    );
}
