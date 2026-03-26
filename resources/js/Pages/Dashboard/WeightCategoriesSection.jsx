import { useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function WeightCategoriesSection({ ageCategories, weightCategories }) {
    const { flash } = usePage().props;
    const [selectedCountry, setSelectedCountry] = useState('BE');
    const [expandedAgeCategory, setExpandedAgeCategory] = useState(null);
    const importFileRef = useRef(null);
    const [importing, setImporting] = useState(false);

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImporting(true);
        router.post('/admin/weight-categories/import', { file }, {
            forceFormData: true,
            onFinish: () => {
                setImporting(false);
                if (importFileRef.current) importFileRef.current.value = '';
            },
        });
    };

    const countries = [...new Set(ageCategories.map((c) => c.country_code))].sort();
    if (!countries.includes(selectedCountry) && countries.length > 0) {
        // fallback to first available
    }

    const filteredAgeCategories = ageCategories.filter((c) => c.country_code === selectedCountry);

    const getWeightsForAgeCategory = (ageCategoryId) =>
        weightCategories.filter((w) => w.age_category_id === ageCategoryId);

    return (
        <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                    Gewichtscategorieën
                    <span className="ml-2 inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                        {weightCategories.length}
                    </span>
                </h2>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-500">Land:</label>
                    <select
                        value={selectedCountry}
                        onChange={(e) => {
                            setSelectedCountry(e.target.value);
                            setExpandedAgeCategory(null);
                        }}
                        className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                        {countries.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <a
                        href="/admin/weight-categories/export"
                        className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50"
                    >
                        Export
                    </a>
                    <input
                        type="file"
                        ref={importFileRef}
                        accept=".xlsx,.xls,.csv"
                        onChange={handleImportFile}
                        className="hidden"
                    />
                    <button
                        onClick={() => importFileRef.current?.click()}
                        disabled={importing}
                        className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50 disabled:opacity-50"
                    >
                        {importing ? 'Importeren...' : 'Import'}
                    </button>
                </div>
            </div>

            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 border ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}

            {filteredAgeCategories.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500">
                    Geen leeftijdscategorieën voor {selectedCountry}. Maak eerst leeftijdscategorieën aan.
                </div>
            ) : (
                <div className="divide-y divide-slate-700">
                    {filteredAgeCategories.map((ageCat) => {
                        const weights = getWeightsForAgeCategory(ageCat.id);
                        const isExpanded = expandedAgeCategory === ageCat.id;
                        return (
                            <AgeCategoryWeightBlock
                                key={ageCat.id}
                                ageCategory={ageCat}
                                weights={weights}
                                isExpanded={isExpanded}
                                onToggle={() => setExpandedAgeCategory(isExpanded ? null : ageCat.id)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function AgeCategoryWeightBlock({ ageCategory, weights, isExpanded, onToggle }) {
    const [showAddForm, setShowAddForm] = useState(false);

    const maleWeights = weights.filter((w) => w.gender === 'male');
    const femaleWeights = weights.filter((w) => w.gender === 'female');

    return (
        <div>
            <button
                onClick={onToggle}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/50"
            >
                <div>
                    <span className="font-medium text-white">{ageCategory.name}</span>
                    <span className="ml-2 text-sm text-slate-400">
                        ({ageCategory.min_age}–{ageCategory.max_age} jaar)
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                        {weights.length} gewichtscategorie{weights.length !== 1 ? 'ën' : ''}
                    </span>
                    <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isExpanded && (
                <div className="px-6 pb-4">
                    <div className="flex items-center justify-end mb-3">
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
                        >
                            {showAddForm ? 'Annuleren' : 'Toevoegen'}
                        </button>
                    </div>

                    {showAddForm && (
                        <AddWeightCategoryForm
                            ageCategoryId={ageCategory.id}
                            onSuccess={() => setShowAddForm(false)}
                        />
                    )}

                    {weights.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">
                            Nog geen gewichtscategorieën.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {maleWeights.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-300 mb-2">Man</h4>
                                    <div className="space-y-1">
                                        {maleWeights.map((w) => (
                                            <WeightCategoryRow key={w.id} weight={w} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {femaleWeights.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-300 mb-2">Vrouw</h4>
                                    <div className="space-y-1">
                                        {femaleWeights.map((w) => (
                                            <WeightCategoryRow key={w.id} weight={w} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function AddWeightCategoryForm({ ageCategoryId, onSuccess }) {
    const form = useForm({
        age_category_id: ageCategoryId,
        name: '',
        gender: 'male',
        max_weight_kg: '',
        display_order: '0',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/admin/weight-categories', {
            onSuccess: () => {
                form.reset();
                form.setData('age_category_id', ageCategoryId);
                onSuccess();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-700/50 rounded-md border border-slate-800 mb-3">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Naam</label>
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        placeholder="bv. -60"
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    {form.errors.name && <p className="text-xs text-red-400 mt-1">{form.errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Geslacht</label>
                    <select
                        value={form.data.gender}
                        onChange={(e) => form.setData('gender', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                        <option value="male">Man</option>
                        <option value="female">Vrouw</option>
                    </select>
                    {form.errors.gender && <p className="text-xs text-red-400 mt-1">{form.errors.gender}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={form.data.max_weight_kg}
                        onChange={(e) => form.setData('max_weight_kg', e.target.value)}
                        min="0" max="999.9"
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    {form.errors.max_weight_kg && <p className="text-xs text-red-400 mt-1">{form.errors.max_weight_kg}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Volgorde</label>
                    <input
                        type="number"
                        value={form.data.display_order}
                        onChange={(e) => form.setData('display_order', e.target.value)}
                        min="0"
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    {form.errors.display_order && <p className="text-xs text-red-400 mt-1">{form.errors.display_order}</p>}
                </div>
            </div>
            <button
                type="submit"
                disabled={form.processing}
                className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
                Opslaan
            </button>
        </form>
    );
}

function WeightCategoryRow({ weight }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({
        name: weight.name,
        gender: weight.gender,
        max_weight_kg: weight.max_weight_kg,
        display_order: weight.display_order,
    });
    const deleteForm = useForm({});

    const handleSave = (e) => {
        e.preventDefault();
        form.patch(`/admin/weight-categories/${weight.id}`, {
            onSuccess: () => setEditing(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`Weet je zeker dat je "${weight.name}" wilt verwijderen?`)) {
            deleteForm.delete(`/admin/weight-categories/${weight.id}`);
        }
    };

    if (editing) {
        return (
            <form onSubmit={handleSave} className="p-3 bg-slate-700/50 rounded-md border border-slate-800">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Naam</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                        {form.errors.name && <p className="text-xs text-red-400 mt-1">{form.errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Geslacht</label>
                        <select
                            value={form.data.gender}
                            onChange={(e) => form.setData('gender', e.target.value)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        >
                            <option value="male">Man</option>
                            <option value="female">Vrouw</option>
                        </select>
                        {form.errors.gender && <p className="text-xs text-red-400 mt-1">{form.errors.gender}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Max (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.data.max_weight_kg}
                            onChange={(e) => form.setData('max_weight_kg', e.target.value)}
                            min="0" max="999.9"
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                        {form.errors.max_weight_kg && <p className="text-xs text-red-400 mt-1">{form.errors.max_weight_kg}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Volgorde</label>
                        <input
                            type="number"
                            value={form.data.display_order}
                            onChange={(e) => form.setData('display_order', e.target.value)}
                            min="0"
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                        {form.errors.display_order && <p className="text-xs text-red-400 mt-1">{form.errors.display_order}</p>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                        Opslaan
                    </button>
                    <button
                        type="button"
                        onClick={() => { form.reset(); setEditing(false); }}
                        className="rounded-md bg-slate-700/50 border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50"
                    >
                        Annuleren
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-slate-700/50">
            <div>
                <span className="font-medium text-white text-sm">{weight.name}</span>
                <span className="ml-2 text-xs text-slate-400">
                    max {weight.max_weight_kg} kg
                </span>
                <span className="ml-2 text-xs text-slate-300">#{weight.display_order}</span>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setEditing(true)}
                    className="text-sm text-rose-400 hover:text-rose-300"
                >
                    Bewerken
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleteForm.processing}
                    className="text-sm text-red-400 hover:text-red-800"
                >
                    Verwijderen
                </button>
            </div>
        </div>
    );
}
