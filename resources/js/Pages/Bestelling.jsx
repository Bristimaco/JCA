import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';

export default function Bestelling({ products, categories }) {
    const { flash } = usePage().props;
    const [quantities, setQuantities] = useState({});
    const [activeCategory, setActiveCategory] = useState(null);
    const [showSummary, setShowSummary] = useState(false);
    const [saving, setSaving] = useState(false);

    const getQty = (id) => quantities[id] || 0;
    const increment = (id) => setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    const decrement = (id) => {
        setQuantities((prev) => {
            const current = prev[id] || 0;
            if (current <= 0) return prev;
            return { ...prev, [id]: current - 1 };
        });
    };

    const total = products.reduce((sum, p) => sum + getQty(p.id) * Number(p.price), 0);
    const itemCount = Object.values(quantities).reduce((sum, q) => sum + q, 0);

    const filteredProducts = activeCategory
        ? products.filter((p) => p.bar_category_id === activeCategory)
        : products;

    const orderItems = products
        .filter((p) => getQty(p.id) > 0)
        .map((p) => ({ id: p.id, name: p.name, price: Number(p.price), quantity: getQty(p.id) }));

    const handleSubmit = () => {
        setSaving(true);
        router.post('/bestelling', {
            items: orderItems.map((item) => ({ product_id: item.id, quantity: item.quantity })),
        }, {
            onSuccess: () => {
                setQuantities({});
                setShowSummary(false);
                setSaving(false);
            },
            onError: () => setSaving(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Bestelling Plaatsen" />

            <div className="flex flex-col h-[calc(100dvh-3.5rem)] overflow-hidden p-2">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-lg font-bold text-white">Bestelling Plaatsen</h1>
                </div>

                {flash?.status && (
                    <div className="mb-2 rounded-lg bg-emerald-900/30 ring-1 ring-emerald-700/40 px-4 py-2.5 text-sm font-medium text-emerald-400">
                        {flash.status}
                    </div>
                )}

                {/* Category filter bar */}
                {categories.length > 1 && (
                    <div className="shrink-0 flex flex-wrap gap-1.5 mb-1">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${activeCategory === null
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-300 ring-1 ring-slate-700 hover:bg-slate-700'
                            }`}
                        >
                            Alle
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${activeCategory === cat.id
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-800 text-slate-300 ring-1 ring-slate-700 hover:bg-slate-700'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Product list */}
                {filteredProducts.length === 0 ? (
                    <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-12 text-center text-slate-500">
                        Geen producten beschikbaar.
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pb-1">
                        {filteredProducts.map((product) => {
                            const qty = getQty(product.id);
                            return (
                                <div
                                    key={product.id}
                                    className={`rounded-lg ring-1 px-3 py-2.5 flex items-center gap-3 select-none transition-all ${qty > 0
                                        ? 'bg-rose-900/20 ring-rose-700/40'
                                        : 'bg-slate-900 ring-slate-800'
                                    }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                                        <p className="text-sm font-bold text-emerald-400">€{Number(product.price).toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => decrement(product.id)}
                                            disabled={qty <= 0}
                                            className="w-9 h-9 rounded-md bg-slate-700 ring-1 ring-slate-600 text-white text-base font-bold flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
                                        >
                                            −
                                        </button>
                                        <span className="w-6 text-center text-base font-bold text-white tabular-nums">{qty}</span>
                                        <button
                                            onClick={() => increment(product.id)}
                                            className="w-9 h-9 rounded-md bg-rose-600 text-white text-base font-bold flex items-center justify-center active:scale-95 transition-transform"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Total bar */}
                <div className="shrink-0 bg-slate-900/95 border-t border-slate-700 px-4 py-2 mt-1">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <p className="text-2xl font-bold text-white tabular-nums">€{total.toFixed(2)}</p>
                            <p className="text-sm text-slate-400">
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowSummary(true)}
                            disabled={itemCount === 0}
                            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Bestelling plaatsen
                        </button>
                    </div>
                </div>

                {/* Order summary overlay */}
                {showSummary && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div className="bg-slate-900 rounded-xl ring-1 ring-slate-700 w-full max-w-md max-h-[80vh] flex flex-col">
                            <div className="px-4 py-3 border-b border-slate-700">
                                <h2 className="text-lg font-bold text-white">Bevestig bestelling</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                                {orderItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-white">{item.name}</p>
                                            <p className="text-xs text-slate-400">{item.quantity}× €{item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-white">€{(item.quantity * item.price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-3 border-t border-slate-700 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-lg font-bold text-white">Totaal</p>
                                    <p className="text-lg font-bold text-emerald-400">€{total.toFixed(2)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowSummary(false)}
                                        className="flex-1 rounded-lg bg-slate-700 ring-1 ring-slate-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-600 transition-colors"
                                    >
                                        Annuleren
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                                    >
                                        {saving ? 'Bezig...' : 'Bevestigen'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
