import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';

export default function Producten({ products }) {
    const { auth, flash } = usePage().props;
    const [search, setSearch] = useState('');
    const isAdmin = auth?.user?.role === 'admin';

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Producten" />

            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-stone-100 tracking-tight">Producten</h1>
                    <p className="text-slate-400 text-xs">Overzicht van alle voedingsproducten — waarden per 100g</p>
                </div>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                    &larr; Dashboard
                </Link>
            </div>

            {flash.status && (
                <div className="mb-4 rounded-md bg-emerald-900/30 ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}

            <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-700/60 border-t-2 border-t-emerald-700">
                <div className="px-3 sm:px-6 py-3 border-b border-slate-700">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Zoek product..."
                        className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-2 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>

                {filtered.length === 0 ? (
                    <div className="px-6 py-8 text-center text-slate-500 text-sm">
                        {search ? 'Geen producten gevonden.' : 'De catalogus is nog leeg.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Product</th>
                                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Kcal</th>
                                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Eiwit</th>
                                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Koolh.</th>
                                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Vetten</th>
                                    {isAdmin && <th className="px-3 sm:px-6 py-3"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-800/30">
                                        <td className="px-3 sm:px-6 py-3 text-sm font-medium text-white">{p.name}</td>
                                        <td className="px-3 sm:px-6 py-3 text-sm text-slate-300 text-right">{p.calories}</td>
                                        <td className="px-3 sm:px-6 py-3 text-sm text-slate-300 text-right">{p.protein}g</td>
                                        <td className="px-3 sm:px-6 py-3 text-sm text-slate-300 text-right">{p.carbohydrates}g</td>
                                        <td className="px-3 sm:px-6 py-3 text-sm text-slate-300 text-right">{p.fats}g</td>
                                        {isAdmin && (
                                            <td className="px-3 sm:px-6 py-3 text-right">
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Product '${p.name}' verwijderen? Dit verwijdert het ook uit alle gebruikerslijsten.`)) {
                                                            router.delete(`/admin/producten/${p.id}`, { preserveScroll: true });
                                                        }
                                                    }}
                                                    className="text-xs font-medium text-red-500 hover:text-red-400"
                                                >
                                                    Verwijderen
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="px-6 py-3 border-t border-slate-800 text-xs text-slate-500">
                    {filtered.length} van {products.length} product{products.length !== 1 ? 'en' : ''}
                </div>
            </div>
        </AppLayout>
    );
}
