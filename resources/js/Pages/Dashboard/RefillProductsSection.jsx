import { useForm } from '@inertiajs/react';

export default function RefillProductsSection({ products }) {
    if (products.length === 0) {
        return (
            <div className="px-3 sm:px-6 py-8 text-center text-slate-500">
                Geen producten om aan te vullen.
            </div>
        );
    }

    return (
        <div className="divide-y divide-slate-700">
            {products.map((product) => (
                <RefillRow key={product.id} product={product} />
            ))}
        </div>
    );
}

function RefillRow({ product }) {
    const form = useForm({});

    const handleClear = () => {
        form.post(`/admin/bar-products/${product.id}/clear-refill`, {
            preserveScroll: true,
        });
    };

    const flaggedAt = product.needs_refill_at ? new Date(product.needs_refill_at) : null;

    return (
        <div className="px-3 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📦</span>
                    <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-emerald-400 font-medium">€{Number(product.price).toFixed(2)}</p>
                    {flaggedAt && (
                        <p className="text-xs text-amber-500">
                            Gemarkeerd op {flaggedAt.toLocaleDateString('nl-BE')} om {flaggedAt.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>
            </div>
            <button
                onClick={handleClear}
                disabled={form.processing}
                className="flex-shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
                ✓ Aangevuld
            </button>
        </div>
    );
}
