import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function BarProductsSection({ products }) {
    const { flash } = usePage().props;
    const [editingId, setEditingId] = useState(null);

    return (
        <>
            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}
            <AddProductForm />
            {products.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500">Geen producten gevonden.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-700 text-left">
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Volgorde</th>
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Product</th>
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Prijs</th>
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Actief</th>
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Acties</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {products.map((p) => (
                                editingId === p.id
                                    ? <EditRow key={p.id} product={p} onCancel={() => setEditingId(null)} onSuccess={() => setEditingId(null)} />
                                    : <ProductRow key={p.id} product={p} onEdit={() => setEditingId(p.id)} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

function AddProductForm() {
    const form = useForm({ name: '', price: '', display_order: '0' });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/admin/bar-products', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="px-3 sm:px-6 py-3 border-b border-slate-700 flex flex-wrap items-end gap-3">
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Naam</label>
                <input
                    type="text"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    className="rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 w-40 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="Cola"
                />
                {form.errors.name && <p className="text-xs text-red-400 mt-1">{form.errors.name}</p>}
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Prijs (€)</label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.data.price}
                    onChange={(e) => form.setData('price', e.target.value)}
                    className="rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 w-24 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="2.50"
                />
                {form.errors.price && <p className="text-xs text-red-400 mt-1">{form.errors.price}</p>}
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Volgorde</label>
                <input
                    type="number"
                    min="0"
                    value={form.data.display_order}
                    onChange={(e) => form.setData('display_order', e.target.value)}
                    className="rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 w-20 focus:ring-rose-500 focus:border-rose-500"
                />
            </div>
            <button
                type="submit"
                disabled={form.processing}
                className="rounded-md bg-rose-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
                {form.processing ? 'Bezig...' : 'Toevoegen'}
            </button>
        </form>
    );
}

function ProductRow({ product, onEdit }) {
    const deleteForm = useForm({});

    const handleDelete = () => {
        if (!window.confirm(`Product "${product.name}" verwijderen?`)) return;
        deleteForm.delete(`/admin/bar-products/${product.id}`, { preserveScroll: true });
    };

    return (
        <tr className="hover:bg-slate-800/30">
            <td className="px-3 sm:px-6 py-3 text-sm text-slate-400">{product.display_order}</td>
            <td className="px-3 sm:px-6 py-3 text-sm font-medium text-white">{product.name}</td>
            <td className="px-3 sm:px-6 py-3 text-sm font-medium text-emerald-400">€{Number(product.price).toFixed(2)}</td>
            <td className="px-3 sm:px-6 py-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.is_active ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                    {product.is_active ? 'Actief' : 'Inactief'}
                </span>
            </td>
            <td className="px-3 sm:px-6 py-3 flex gap-2">
                <button onClick={onEdit} className="text-xs font-medium text-sky-400 hover:text-sky-300">Bewerken</button>
                <button onClick={handleDelete} disabled={deleteForm.processing} className="text-xs font-medium text-red-500 hover:text-red-400 disabled:opacity-50">
                    {deleteForm.processing ? 'Bezig...' : 'Verwijderen'}
                </button>
            </td>
        </tr>
    );
}

function EditRow({ product, onCancel, onSuccess }) {
    const form = useForm({
        name: product.name,
        price: product.price,
        is_active: product.is_active,
        display_order: product.display_order,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.patch(`/admin/bar-products/${product.id}`, {
            preserveScroll: true,
            onSuccess,
        });
    };

    return (
        <tr className="bg-slate-800/30">
            <td className="px-3 sm:px-6 py-3">
                <input type="number" min="0" value={form.data.display_order} onChange={(e) => form.setData('display_order', e.target.value)}
                    className="rounded-md bg-slate-800 border-slate-700 text-white text-sm px-2 py-1 w-16 focus:ring-rose-500 focus:border-rose-500" />
            </td>
            <td className="px-3 sm:px-6 py-3">
                <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)}
                    className="rounded-md bg-slate-800 border-slate-700 text-white text-sm px-2 py-1 w-32 focus:ring-rose-500 focus:border-rose-500" />
            </td>
            <td className="px-3 sm:px-6 py-3">
                <input type="number" step="0.01" min="0" value={form.data.price} onChange={(e) => form.setData('price', e.target.value)}
                    className="rounded-md bg-slate-800 border-slate-700 text-white text-sm px-2 py-1 w-20 focus:ring-rose-500 focus:border-rose-500" />
            </td>
            <td className="px-3 sm:px-6 py-3">
                <button type="button" onClick={() => form.setData('is_active', !form.data.is_active)}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer ${form.data.is_active ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                    {form.data.is_active ? 'Actief' : 'Inactief'}
                </button>
            </td>
            <td className="px-3 sm:px-6 py-3 flex gap-2">
                <button onClick={handleSubmit} disabled={form.processing} className="text-xs font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                    {form.processing ? 'Bezig...' : 'Opslaan'}
                </button>
                <button onClick={onCancel} className="text-xs font-medium text-slate-400 hover:text-slate-300">Annuleren</button>
            </td>
        </tr>
    );
}
