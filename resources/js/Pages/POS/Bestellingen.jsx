import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import QrPaymentOverlay from '../../Components/QrPaymentOverlay';

const statusLabels = {
    pending: 'Wachtend',
    preparing: 'Wordt klaargezet',
    ready: 'Klaar',
};

const statusColors = {
    pending: 'bg-amber-900/30 text-amber-400 ring-amber-700/40',
    preparing: 'bg-blue-900/30 text-blue-400 ring-blue-700/40',
    ready: 'bg-emerald-900/30 text-emerald-400 ring-emerald-700/40',
};

export default function Bestellingen({ orders: initialOrders }) {
    const [orders, setOrders] = useState(initialOrders);
    const [qrPayment, setQrPayment] = useState(null);
    const [qrOrderId, setQrOrderId] = useState(null);
    const [poefSearch, setPoefSearch] = useState({});
    const [poefUsers, setPoefUsers] = useState({});
    const [poefQuery, setPoefQuery] = useState({});

    const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.content;

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['orders'], onSuccess: (page) => {
                setOrders(page.props.orders);
            }});
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = (orderId, action, data = {}) => {
        router.patch(`/pos/bestellingen/${orderId}/${action}`, data, {
            preserveScroll: true,
            onSuccess: (page) => {
                setOrders(page.props.orders);
            },
        });
    };

    const handleQrPayment = async (order) => {
        try {
            const res = await fetch('/pos/payment/qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), Accept: 'application/json' },
                body: JSON.stringify({ amount: Number(order.total), order_id: order.id }),
            });
            if (res.ok) {
                const data = await res.json();
                setQrPayment(data);
                setQrOrderId(order.id);
            }
        } catch { /* network error */ }
    };

    const handleQrPaid = () => {
        setQrPayment(null);
        setQrOrderId(null);
        router.reload({ only: ['orders'], onSuccess: (page) => setOrders(page.props.orders) });
    };

    const handlePoefSearch = async (orderId, query) => {
        setPoefQuery((prev) => ({ ...prev, [orderId]: query }));
        if (query.length < 2) {
            setPoefUsers((prev) => ({ ...prev, [orderId]: [] }));
            return;
        }
        try {
            const res = await fetch(`/pos/users/search?q=${encodeURIComponent(query)}`, {
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                setPoefUsers((prev) => ({ ...prev, [orderId]: data }));
            }
        } catch { /* network error */ }
    };

    const togglePoefSearch = (orderId) => {
        setPoefSearch((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
    };

    const selectPoefUser = (orderId, userId) => {
        handleAction(orderId, 'poef', { ordered_by_user_id: userId });
        setPoefSearch((prev) => ({ ...prev, [orderId]: false }));
        setPoefQuery((prev) => ({ ...prev, [orderId]: '' }));
        setPoefUsers((prev) => ({ ...prev, [orderId]: [] }));
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AppLayout fullWidth>
            <Head title="Bestellingen" />

            <div className="flex flex-col h-[calc(100dvh-3.5rem)] overflow-hidden p-2">
                <div className="shrink-0 flex items-center gap-4 mb-2">
                    <Link href="/pos" className="text-sm font-medium text-slate-500 hover:text-slate-300">
                        &larr; Kassa
                    </Link>
                    <h1 className="text-xl font-bold text-white tracking-tight">Bestellingen</h1>
                    <span className="text-sm text-slate-400">{orders.length} actief</span>
                    <Link href="/" className="ml-auto text-sm font-medium text-slate-400 hover:text-slate-300">
                        ← Dashboard
                    </Link>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-2">
                    {orders.length === 0 ? (
                        <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-12 text-center text-slate-500">
                            Geen openstaande bestellingen.
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="rounded-lg bg-slate-900 ring-1 ring-slate-800 p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white">#{order.id}</span>
                                        <span className="text-xs text-slate-400">{formatTime(order.created_at)}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${statusColors[order.status]}`}>
                                            {statusLabels[order.status]}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-slate-400">
                                            {order.ordered_by?.name || 'Kassa'}
                                        </span>
                                        <span className="text-sm font-bold text-emerald-400">€{Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {order.items.map((item) => (
                                        <span key={item.id} className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                                            {item.product?.name || 'Product'} ×{item.quantity}
                                        </span>
                                    ))}
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-wrap gap-1.5">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleAction(order.id, 'preparing')}
                                            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                                        >
                                            Start klaarzetten
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button
                                            onClick={() => handleAction(order.id, 'ready')}
                                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                                        >
                                            Klaar
                                        </button>
                                    )}
                                    {order.status === 'ready' && (
                                        <>
                                            <button
                                                onClick={() => handleQrPayment(order)}
                                                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                                            >
                                                QR Betaling
                                            </button>
                                            <button
                                                onClick={() => handleAction(order.id, 'paid', { payment_method: 'other' })}
                                                className="rounded-md bg-slate-700 ring-1 ring-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600 transition-colors"
                                            >
                                                Betaald via andere weg
                                            </button>
                                            {order.ordered_by_user_id ? (
                                                <button
                                                    onClick={() => handleAction(order.id, 'poef')}
                                                    className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
                                                >
                                                    Poef
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => togglePoefSearch(order.id)}
                                                    className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors"
                                                >
                                                    Poef
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Poef user search (for orders without ordered_by_user_id) */}
                                {poefSearch[order.id] && !order.ordered_by_user_id && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={poefQuery[order.id] || ''}
                                            onChange={(e) => handlePoefSearch(order.id, e.target.value)}
                                            placeholder="Zoek gebruiker..."
                                            className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 focus:ring-amber-500 focus:border-amber-500"
                                        />
                                        {(poefUsers[order.id] || []).length > 0 && (
                                            <div className="mt-1 rounded-md bg-slate-800 ring-1 ring-slate-700 max-h-40 overflow-y-auto">
                                                {poefUsers[order.id].map((user) => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => selectPoefUser(order.id, user.id)}
                                                        className="w-full text-left px-3 py-1.5 text-sm text-white hover:bg-slate-700 transition-colors"
                                                    >
                                                        {user.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {qrPayment && (
                <QrPaymentOverlay
                    amount={orders.find((o) => o.id === qrOrderId)?.total || 0}
                    paymentId={qrPayment.payment_id}
                    qrSrc={qrPayment.qr_src}
                    checkoutUrl={qrPayment.checkout_url}
                    onClose={() => { setQrPayment(null); setQrOrderId(null); }}
                    onPaid={handleQrPaid}
                />
            )}
        </AppLayout>
    );
}
