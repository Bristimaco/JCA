import { useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function AgeCategoriesSection({ ageCategories }) {
    const { flash } = usePage().props;
    const [selectedCountry, setSelectedCountry] = useState('BE');
    const [showAddForm, setShowAddForm] = useState(false);
    const recalcForm = useForm({ country_code: 'BE' });
    const importFileRef = useRef(null);
    const [importing, setImporting] = useState(false);

    const countries = [...new Set(ageCategories.map((c) => c.country_code))];
    if (!countries.includes(selectedCountry)) {
        countries.push(selectedCountry);
    }
    countries.sort();

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImporting(true);
        router.post('/admin/age-categories/import', { file }, {
            forceFormData: true,
            onFinish: () => {
                setImporting(false);
                if (importFileRef.current) importFileRef.current.value = '';
            },
        });
    };

    const filtered = ageCategories.filter((c) => c.country_code === selectedCountry);

    return (
        <>
            <div className="px-6 py-3 flex items-center justify-end gap-3 flex-wrap border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-500">Land:</label>
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        >
                            {countries.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Nieuw land (bv. FR)"
                            maxLength={2}
                            className="w-24 rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1 px-2 uppercase focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            onBlur={(e) => {
                                const val = e.target.value.toUpperCase().trim();
                                if (val.length === 2) {
                                    setSelectedCountry(val);
                                    e.target.value = '';
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.target.blur();
                                }
                            }}
                        />
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
                    >
                        {showAddForm ? 'Annuleren' : 'Toevoegen'}
                    </button>
                    <a
                        href="/admin/age-categories/export"
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
                    <button
                        onClick={() => {
                            recalcForm.setData('country_code', selectedCountry);
                            recalcForm.post('/admin/age-categories/recalculate', { preserveScroll: true });
                        }}
                        disabled={recalcForm.processing}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {recalcForm.processing ? 'Bezig...' : 'Herbereken'}
                    </button>
            </div>

            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 border ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}

            {showAddForm && (
                <AddAgeCategoryForm
                    countryCode={selectedCountry}
                    onSuccess={() => setShowAddForm(false)}
                />
            )}

            {filtered.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500">
                    Geen leeftijdscategorieën voor {selectedCountry}.
                </div>
            ) : (
                <div className="divide-y divide-slate-700">
                    {filtered.map((cat) => (
                        <AgeCategoryRow key={cat.id} category={cat} />
                    ))}
                </div>
            )}
        </>
    );
}

function AddAgeCategoryForm({ countryCode, onSuccess }) {
    const form = useForm({
        name: '',
        country_code: countryCode,
        min_age: '',
        max_age: '',
        cutoff_date: '',
        display_order: '0',
    });

    // Keep country_code in sync when parent changes
    if (form.data.country_code !== countryCode) {
        form.setData('country_code', countryCode);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            cutoff_date: data.cutoff_date || null,
        }));
        form.post('/admin/age-categories', {
            onSuccess: () => {
                form.reset();
                onSuccess();
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="px-6 py-4 bg-slate-700/50 border-b border-slate-700">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Naam</label>
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        placeholder="bv. U15"
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    {form.errors.name && <p className="text-xs text-red-400 mt-1">{form.errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Min leeftijd</label>
                    <input
                        type="number"
                        value={form.data.min_age}
                        onChange={(e) => form.setData('min_age', e.target.value)}
                        min="0" max="99"
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    {form.errors.min_age && <p className="text-xs text-red-400 mt-1">{form.errors.min_age}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max leeftijd</label>
                    <input
                        type="number"
                        value={form.data.max_age}
                        onChange={(e) => form.setData('max_age', e.target.value)}
                        min="0" max="99"
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    {form.errors.max_age && <p className="text-xs text-red-400 mt-1">{form.errors.max_age}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Omslagdatum</label>
                    <input
                        type="text"
                        value={form.data.cutoff_date}
                        onChange={(e) => form.setData('cutoff_date', e.target.value)}
                        placeholder="MM-DD (leeg = jaar)"
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    {form.errors.cutoff_date && <p className="text-xs text-red-400 mt-1">{form.errors.cutoff_date}</p>}
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

function AgeCategoryRow({ category }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({
        name: category.name,
        min_age: category.min_age,
        max_age: category.max_age,
        cutoff_date: category.cutoff_date || '',
        display_order: category.display_order,
    });
    const deleteForm = useForm({});

    const handleSave = (e) => {
        e.preventDefault();
        form.transform((data) => ({
            ...data,
            cutoff_date: data.cutoff_date || null,
        }));
        form.patch(`/admin/age-categories/${category.id}`, {
            onSuccess: () => setEditing(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`Weet je zeker dat je "${category.name}" wilt verwijderen?`)) {
            deleteForm.delete(`/admin/age-categories/${category.id}`);
        }
    };

    if (editing) {
        return (
            <form onSubmit={handleSave} className="px-6 py-4 bg-slate-700/50">
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
                        <label className="block text-xs font-medium text-slate-400 mb-1">Min leeftijd</label>
                        <input
                            type="number"
                            value={form.data.min_age}
                            onChange={(e) => form.setData('min_age', e.target.value)}
                            min="0" max="99"
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                        {form.errors.min_age && <p className="text-xs text-red-400 mt-1">{form.errors.min_age}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Max leeftijd</label>
                        <input
                            type="number"
                            value={form.data.max_age}
                            onChange={(e) => form.setData('max_age', e.target.value)}
                            min="0" max="99"
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                        {form.errors.max_age && <p className="text-xs text-red-400 mt-1">{form.errors.max_age}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Omslagdatum</label>
                        <input
                            type="text"
                            value={form.data.cutoff_date}
                            onChange={(e) => form.setData('cutoff_date', e.target.value)}
                            placeholder="MM-DD (leeg = jaar)"
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                        {form.errors.cutoff_date && <p className="text-xs text-red-400 mt-1">{form.errors.cutoff_date}</p>}
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
        <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
                <p className="font-medium text-white">
                    {category.name}
                    <span className="ml-2 text-sm text-slate-400">
                        ({category.min_age}–{category.max_age} jaar)
                    </span>
                </p>
                <p className="text-xs text-slate-400">
                    {category.cutoff_date
                        ? `Omslagdatum: ${category.cutoff_date}`
                        : 'Jaar-gebaseerd'}
                    {' · '}Volgorde: {category.display_order}
                </p>
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
