import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import AppLayout from '../Layouts/AppLayout';

export default function MijnProducten({ myProducts, catalog }) {
    const { flash } = usePage().props;
    const [searchName, setSearchName] = useState('');

    const match = useMemo(() => {
        if (!searchName.trim()) return null;
        return catalog.find((p) => p.name.toLowerCase() === searchName.trim().toLowerCase()) || null;
    }, [searchName, catalog]);

    const hasPartialMatches = useMemo(() => {
        if (!searchName.trim()) return false;
        return catalog.some((p) => p.name.toLowerCase().includes(searchName.trim().toLowerCase()));
    }, [searchName, catalog]);

    const isAlreadyInMyList = match ? myProducts.some((p) => p.id === match.id) : false;

    return (
        <AppLayout>
            <Head title="Mijn Producten" />

            <div className="mb-4">
                <h1 className="text-xl font-bold text-stone-100 tracking-tight">Mijn Producten</h1>
                <p className="text-slate-400 text-xs">Je persoonlijke voedingsproducten</p>
            </div>

            {flash.status && (
                <div className="mb-4 rounded-md bg-emerald-900/30 ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}

            {/* Add product section */}
            <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-700/60 border-t-2 border-t-lime-700 mb-6">
                <div className="px-6 py-4 border-b border-slate-800/60">
                    <h2 className="text-lg font-semibold text-white">Product toevoegen</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Zoek een bestaand product of maak een nieuw product aan</p>
                </div>

                <div className="px-3 sm:px-6 py-4">
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Productnaam</label>
                        <input
                            type="text"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="Bijv. Bruin brood"
                            className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-2 placeholder-slate-500 focus:ring-lime-500 focus:border-lime-500 max-w-md"
                        />
                    </div>

                    {searchName.trim() && (
                        <>
                            {match ? (
                                <MatchFound product={match} isAlreadyInMyList={isAlreadyInMyList} onDone={() => setSearchName('')} />
                            ) : (
                                <CreateNewProduct
                                    name={searchName.trim()}
                                    suggestions={hasPartialMatches ? catalog.filter((p) => p.name.toLowerCase().includes(searchName.trim().toLowerCase())) : []}
                                    onDone={() => setSearchName('')}
                                    onSelectSuggestion={(name) => setSearchName(name)}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* My products list */}
            <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-700/60 border-t-2 border-t-rose-700">
                <div className="px-6 py-4 border-b border-slate-800/60">
                    <h2 className="text-lg font-semibold text-white">Mijn lijst</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{myProducts.length} product{myProducts.length !== 1 ? 'en' : ''}</p>
                </div>
                {myProducts.length === 0 ? (
                    <div className="px-6 py-8 text-center text-slate-500 text-sm">
                        Je hebt nog geen producten in je lijst. Voeg er eentje toe hierboven.
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
                                    <th className="px-3 sm:px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {myProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-800/30">
                                        <td className="px-3 sm:px-6 py-3 text-sm font-medium text-white">{p.name}</td>
                                        <td className="px-3 sm:px-6 py-3 text-sm text-slate-300 text-right">{p.calories}</td>
                                        <td className="px-3 sm:px-6 py-3 text-sm text-slate-300 text-right">{p.protein}g</td>
                                        <td className="px-3 sm:px-6 py-3 text-sm text-slate-300 text-right">{p.carbohydrates}g</td>
                                        <td className="px-3 sm:px-6 py-3 text-sm text-slate-300 text-right">{p.fats}g</td>
                                        <td className="px-3 sm:px-6 py-3 text-right">
                                            <button
                                                onClick={() => {
                                                    router.delete(`/mijn-producten/${p.id}`, { preserveScroll: true });
                                                }}
                                                className="text-xs font-medium text-red-500 hover:text-red-400"
                                            >
                                                Verwijderen
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function MatchFound({ product, isAlreadyInMyList, onDone }) {
    const handleAdd = () => {
        router.post('/mijn-producten', { name: product.name }, {
            preserveScroll: true,
            onSuccess: () => onDone(),
        });
    };

    return (
        <div className="rounded-lg ring-1 ring-emerald-700/30 bg-emerald-900/20 p-4 max-w-md">
            <p className="text-xs font-medium text-emerald-400 mb-2">Product gevonden in catalogus</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-3">
                <span className="text-slate-400">Naam:</span>
                <span className="text-white font-medium">{product.name}</span>
                <span className="text-slate-400">Calorieën:</span>
                <span className="text-slate-200">{product.calories} kcal</span>
                <span className="text-slate-400">Eiwit:</span>
                <span className="text-slate-200">{product.protein}g</span>
                <span className="text-slate-400">Koolhydraten:</span>
                <span className="text-slate-200">{product.carbohydrates}g</span>
                <span className="text-slate-400">Vetten:</span>
                <span className="text-slate-200">{product.fats}g</span>
            </div>
            {isAlreadyInMyList ? (
                <p className="text-xs text-amber-400">Dit product staat al in je lijst.</p>
            ) : (
                <button
                    onClick={handleAdd}
                    className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                    Toevoegen aan mijn lijst
                </button>
            )}
        </div>
    );
}

function CreateNewProduct({ name, suggestions, onDone, onSelectSuggestion }) {
    const form = useForm({ name, calories: '', protein: '', carbohydrates: '', fats: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/mijn-producten', {
            preserveScroll: true,
            onSuccess: () => onDone(),
        });
    };

    return (
        <div className="max-w-md">
            {suggestions.length > 0 && (
                <div className="rounded-lg ring-1 ring-amber-700/30 bg-amber-900/20 p-3 mb-3">
                    <p className="text-xs font-medium text-amber-400 mb-1">Bedoelde je misschien:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {suggestions.slice(0, 5).map((s) => (
                            <button
                                key={s.id}
                                onClick={() => onSelectSuggestion(s.name)}
                                className="rounded-full bg-amber-800/40 px-2.5 py-0.5 text-xs text-amber-200 hover:bg-amber-700/50 transition-colors"
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-lg ring-1 ring-slate-700 bg-slate-800/50 p-4">
                <p className="text-xs font-medium text-slate-400 mb-3">
                    <span className="text-white">"{name}"</span> bestaat nog niet — vul de voedingswaarden in (per 100g)
                </p>
                <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Calorieën (kcal)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={form.data.calories}
                                onChange={(e) => form.setData('calories', e.target.value)}
                                className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5"
                            />
                            {form.errors.calories && <p className="text-xs text-red-400 mt-1">{form.errors.calories}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Eiwit (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={form.data.protein}
                                onChange={(e) => form.setData('protein', e.target.value)}
                                className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5"
                            />
                            {form.errors.protein && <p className="text-xs text-red-400 mt-1">{form.errors.protein}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Koolhydraten (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={form.data.carbohydrates}
                                onChange={(e) => form.setData('carbohydrates', e.target.value)}
                                className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5"
                            />
                            {form.errors.carbohydrates && <p className="text-xs text-red-400 mt-1">{form.errors.carbohydrates}</p>}
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Vetten (g)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={form.data.fats}
                                onChange={(e) => form.setData('fats', e.target.value)}
                                className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5"
                            />
                            {form.errors.fats && <p className="text-xs text-red-400 mt-1">{form.errors.fats}</p>}
                        </div>
                    </div>
                    {form.errors.name && <p className="text-xs text-red-400">{form.errors.name}</p>}
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-md bg-lime-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-lime-700 disabled:opacity-50"
                    >
                        {form.processing ? 'Bezig...' : 'Aanmaken & Toevoegen'}
                    </button>
                </form>
            </div>
        </div>
    );
}
