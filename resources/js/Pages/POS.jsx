import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';

export default function POS({ products }) {
    const [quantities, setQuantities] = useState({});

    const getQty = (id) => quantities[id] || 0;

    const increment = (id) => {
        setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const decrement = (id) => {
        setQuantities((prev) => {
            const current = prev[id] || 0;
            if (current <= 0) return prev;
            return { ...prev, [id]: current - 1 };
        });
    };

    const total = products.reduce((sum, p) => sum + getQty(p.id) * Number(p.price), 0);
    const itemCount = Object.values(quantities).reduce((sum, q) => sum + q, 0);

    const reset = () => setQuantities({});

    return (
        <AppLayout>
            <Head title="Kassa" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-300">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white tracking-tight">Kassa</h1>
            </div>

            {products.length === 0 ? (
                <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-12 text-center text-slate-500">
                    Geen producten beschikbaar.
                </div>
            ) : (
                <div className="pb-28">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {products.map((product) => {
                            const qty = getQty(product.id);
                            return (
                                <div
                                    key={product.id}
                                    className={`relative rounded-xl ring-1 p-4 flex flex-col items-center select-none transition-all ${qty > 0
                                            ? 'bg-rose-900/20 ring-rose-700/40 shadow-md'
                                            : 'bg-slate-900 ring-slate-800 hover:ring-slate-700'
                                        }`}
                                >
                                    {qty > 0 && (
                                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                            {qty}
                                        </div>
                                    )}

                                    <p className="text-base font-semibold text-white text-center mb-1 leading-tight">{product.name}</p>
                                    <p className="text-lg font-bold text-emerald-400 mb-4">€{Number(product.price).toFixed(2)}</p>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => decrement(product.id)}
                                            disabled={qty <= 0}
                                            className="w-10 h-10 rounded-lg bg-slate-700 ring-1 ring-slate-600 text-white text-xl font-bold flex items-center justify-center hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
                                        >
                                            −
                                        </button>
                                        <span className="w-8 text-center text-lg font-bold text-white tabular-nums">{qty}</span>
                                        <button
                                            onClick={() => increment(product.id)}
                                            className="w-10 h-10 rounded-lg bg-rose-600 text-white text-xl font-bold flex items-center justify-center hover:bg-rose-700 active:scale-95 transition-transform"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Sticky total bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-4 py-4 z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-400">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </p>
                        <p className="text-3xl font-bold text-white tabular-nums">€{total.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={reset}
                        disabled={itemCount === 0}
                        className="rounded-lg bg-slate-700 ring-1 ring-slate-600 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        Nieuwe bestelling
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
