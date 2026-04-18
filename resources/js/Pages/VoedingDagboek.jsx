import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import AppLayout from '../Layouts/AppLayout';

const CATEGORIES = [
    { key: 'ontbijt', label: 'Ontbijt', icon: '🌅' },
    { key: 'middagmaal', label: 'Middagmaal', icon: '☀️' },
    { key: 'avondmaal', label: 'Avondmaal', icon: '🌙' },
    { key: 'tussendoortjes', label: 'Tussendoortjes', icon: '🍎' },
];

export default function VoedingDagboek({ member, entries, myProducts, catalog, trainingTypes, todayTrainings }) {
    const { flash } = usePage().props;
    const [openCategory, setOpenCategory] = useState('ontbijt');

    const totals = useMemo(() => {
        const t = { calories: 0, protein: 0, carbohydrates: 0, fats: 0 };
        entries.forEach((e) => {
            t.calories += e.calories;
            t.protein += e.protein;
            t.carbohydrates += e.carbohydrates;
            t.fats += e.fats;
        });
        return {
            calories: Math.round(t.calories * 10) / 10,
            protein: Math.round(t.protein * 10) / 10,
            carbohydrates: Math.round(t.carbohydrates * 10) / 10,
            fats: Math.round(t.fats * 10) / 10,
        };
    }, [entries]);

    // Calculate training surplus for active trainings today
    const trainingSurplus = useMemo(() => {
        const s = { calories: 0, protein: 0, carbohydrates: 0, fats: 0 };
        (todayTrainings || []).forEach((dt) => {
            const tt = (trainingTypes || []).find((t) => t.id === dt.training_type_id);
            if (!tt) return;
            // For calories: use actual_calories if set, otherwise surplus_calories
            s.calories += dt.actual_calories != null ? parseFloat(dt.actual_calories) : parseFloat(tt.surplus_calories || 0);
            s.protein += parseFloat(tt.surplus_protein || 0);
            s.carbohydrates += parseFloat(tt.surplus_carbohydrates || 0);
            s.fats += parseFloat(tt.surplus_fats || 0);
        });
        return s;
    }, [todayTrainings, trainingTypes]);

    const plan = member.nutrition_plan;

    return (
        <AppLayout>
            <Head title={`Voeding — ${member.name}`} />

            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-stone-100 tracking-tight">{member.name}</h1>
                    <p className="text-slate-400 text-xs">Voedingsdagboek — {new Date().toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
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

            {/* Gauge meters */}
            {plan && <GaugePanel totals={totals} plan={plan} trainingSurplus={trainingSurplus} />}

            {/* Training section */}
            {(trainingTypes || []).length > 0 && (
                <TrainingSection
                    trainingTypes={trainingTypes}
                    todayTrainings={todayTrainings || []}
                    memberId={member.id}
                />
            )}

            {/* Meal categories */}
            <div className="space-y-3">
                {CATEGORIES.map(({ key, label, icon }) => (
                    <MealCategory
                        key={key}
                        categoryKey={key}
                        label={label}
                        icon={icon}
                        entries={entries.filter((e) => e.category === key)}
                        myProducts={myProducts}
                        catalog={catalog}
                        memberId={member.id}
                        isOpen={openCategory === key}
                        onToggle={() => setOpenCategory(openCategory === key ? null : key)}
                    />
                ))}
            </div>
        </AppLayout>
    );
}

/* ─── Gauge Panel ─── */
function GaugePanel({ totals, plan, trainingSurplus }) {
    const s = trainingSurplus || { calories: 0, protein: 0, carbohydrates: 0, fats: 0 };
    const gauges = [
        { label: 'Calorieën', unit: 'kcal', value: totals.calories, min: parseFloat(plan.min_calories || 0) + s.calories, max: parseFloat(plan.max_calories || 0) + s.calories },
    ];

    if (plan.min_protein != null || plan.max_protein != null) {
        gauges.push({ label: 'Eiwit', unit: 'g', value: totals.protein, min: parseFloat(plan.min_protein || 0) + s.protein, max: parseFloat(plan.max_protein || 0) + s.protein });
    }
    if (plan.min_carbohydrates != null || plan.max_carbohydrates != null) {
        gauges.push({ label: 'Koolhydraten', unit: 'g', value: totals.carbohydrates, min: parseFloat(plan.min_carbohydrates || 0) + s.carbohydrates, max: parseFloat(plan.max_carbohydrates || 0) + s.carbohydrates });
    }
    if (plan.min_fats != null || plan.max_fats != null) {
        gauges.push({ label: 'Vetten', unit: 'g', value: totals.fats, min: parseFloat(plan.min_fats || 0) + s.fats, max: parseFloat(plan.max_fats || 0) + s.fats });
    }

    return (
        <div className={`grid gap-3 mb-4 ${gauges.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {gauges.map((g) => (
                <Gauge key={g.label} {...g} />
            ))}
        </div>
    );
}

function Gauge({ label, unit, value, min, max }) {
    const numMin = parseFloat(min) || 0;
    const numMax = parseFloat(max) || numMin || 1;
    const pct = numMax > 0 ? Math.min((value / numMax) * 100, 150) : 0;
    const displayPct = Math.min(pct, 100);

    let color, status;
    if (value < numMin) {
        color = 'text-amber-400';
        status = 'Onder minimum';
    } else if (value <= numMax) {
        color = 'text-lime-400';
        status = 'In range';
    } else {
        color = 'text-red-400';
        status = 'Boven maximum';
    }

    // SVG arc gauge
    const radius = 36;
    const circumference = Math.PI * radius; // half circle
    const offset = circumference - (displayPct / 100) * circumference;

    let strokeColor;
    if (value < numMin) strokeColor = '#f59e0b';
    else if (value <= numMax) strokeColor = '#84cc16';
    else strokeColor = '#ef4444';

    return (
        <div className="bg-slate-900 rounded-xl ring-1 ring-slate-700/60 p-3 flex flex-col items-center">
            <svg width="90" height="55" viewBox="0 0 90 55" className="mb-1">
                {/* Background arc */}
                <path
                    d="M 9 50 A 36 36 0 0 1 81 50"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
                {/* Value arc */}
                <path
                    d="M 9 50 A 36 36 0 0 1 81 50"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-500"
                />
            </svg>
            <p className={`text-lg font-bold ${color}`}>{Math.round(value)}</p>
            <p className="text-xs text-slate-500">{label} ({unit})</p>
            <p className="text-xs text-slate-600 mt-0.5">{numMin}–{numMax} {unit}</p>
        </div>
    );
}

/* ─── Training Section ─── */
function TrainingSection({ trainingTypes, todayTrainings, memberId }) {
    const [isOpen, setIsOpen] = useState(false);
    const activeCount = todayTrainings.length;

    return (
        <div className="bg-slate-900 rounded-xl ring-1 ring-slate-700/60 border-t-2 border-t-orange-700 overflow-hidden mb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">🏋️</span>
                    <span className="text-sm font-semibold text-white">Trainingen vandaag</span>
                    <span className="text-xs text-slate-500">({activeCount} actief)</span>
                </div>
                <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="border-t border-slate-800/60 divide-y divide-slate-800/40">
                    {trainingTypes.map((tt) => {
                        const active = todayTrainings.find((dt) => dt.training_type_id === tt.id);
                        return (
                            <TrainingToggleRow key={tt.id} tt={tt} active={active} memberId={memberId} />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function TrainingToggleRow({ tt, active, memberId }) {
    const [actualCal, setActualCal] = useState(active?.actual_calories ?? '');
    const [saving, setSaving] = useState(false);

    const handleToggle = () => {
        router.post(`/voeding-dagboek/${memberId}/trainingen`, { training_type_id: tt.id }, { preserveScroll: true });
    };

    const handleSaveActual = () => {
        if (!active) return;
        setSaving(true);
        router.patch(`/voeding-dagboek/trainingen/${active.id}`, {
            actual_calories: actualCal === '' ? null : actualCal,
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                    onClick={handleToggle}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        active
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : 'border-slate-600 hover:border-orange-500'
                    }`}
                >
                    {active && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-400'}`}>{tt.name}</span>
                        {tt.is_default && <span className="text-xs bg-orange-900/40 text-orange-400 px-1.5 py-0.5 rounded-full">Standaard</span>}
                    </div>
                    <span className="text-xs text-slate-500">+{tt.surplus_calories} kcal{tt.surplus_protein != null ? `, +${tt.surplus_protein}g eiwit` : ''}</span>
                </div>
            </div>
            {active && (
                <div className="flex items-center gap-2 ml-8 sm:ml-0">
                    <label className="text-xs text-slate-500 whitespace-nowrap">Werkelijk:</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={actualCal}
                        onChange={(e) => setActualCal(e.target.value)}
                        placeholder={tt.surplus_calories}
                        className="w-24 rounded-md bg-slate-800 border-slate-700 text-white text-xs px-2 py-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <span className="text-xs text-slate-500">kcal</span>
                    <button
                        onClick={handleSaveActual}
                        disabled={saving}
                        className="text-xs text-orange-400 hover:text-orange-300 disabled:opacity-50"
                    >
                        {saving ? '...' : 'Opslaan'}
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─── Meal Category ─── */
function MealCategory({ categoryKey, label, icon, entries, myProducts, catalog, memberId, isOpen, onToggle }) {
    const categoryTotal = useMemo(() => {
        const t = { calories: 0, protein: 0, carbohydrates: 0, fats: 0 };
        entries.forEach((e) => {
            t.calories += e.calories;
            t.protein += e.protein;
            t.carbohydrates += e.carbohydrates;
            t.fats += e.fats;
        });
        return t;
    }, [entries]);

    return (
        <div className="bg-slate-900 rounded-xl ring-1 ring-slate-700/60 border-t-2 border-t-lime-700 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-semibold text-white">{label}</span>
                    <span className="text-xs text-slate-500">({entries.length} item{entries.length !== 1 ? 's' : ''})</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{Math.round(categoryTotal.calories)} kcal</span>
                    <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="border-t border-slate-800/60">
                    {entries.length > 0 && (
                        <div className="divide-y divide-slate-800/40">
                            {entries.map((entry) => (
                                <div key={entry.id} className="px-4 py-2.5 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-white font-medium">{entry.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {entry.grams}g · {entry.calories} kcal · {entry.protein}g eiwit · {entry.carbohydrates}g koolh. · {entry.fats}g vet
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => router.delete(`/voeding-dagboek/${entry.id}`, { preserveScroll: true })}
                                        className="text-xs font-medium text-red-500 hover:text-red-400 ml-3 shrink-0"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <AddEntryForm categoryKey={categoryKey} myProducts={myProducts} catalog={catalog} memberId={memberId} />
                </div>
            )}
        </div>
    );
}

/* ─── Add Entry Form ─── */
function AddEntryForm({ categoryKey, myProducts, catalog, memberId }) {
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [showNewProduct, setShowNewProduct] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [grams, setGrams] = useState('100');
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState(false);

    // Auto-select newly added product via flash
    useEffect(() => {
        if (flash.added_product_id) {
            const newProduct = myProducts.find((p) => p.id === Number(flash.added_product_id));
            if (newProduct) {
                setSelectedProductId(String(newProduct.id));
                setGrams(String(newProduct.pivot?.default_portion ?? 100));
                setShowNewProduct(false);
                setShowForm(true);
            }
        }
    }, [flash.added_product_id, myProducts]);

    const filtered = useMemo(() => {
        if (!search.trim()) return myProducts;
        return myProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }, [myProducts, search]);

    const selectedProduct = myProducts.find((p) => p.id === Number(selectedProductId));

    // When selecting a product, set grams to its default portion
    const handleSelectProduct = (id) => {
        setSelectedProductId(String(id));
        setSearch('');
        const product = myProducts.find((p) => p.id === Number(id));
        if (product) {
            setGrams(String(product.pivot?.default_portion ?? 100));
        }
    };

    const preview = selectedProduct && grams > 0 ? {
        calories: Math.round((parseFloat(grams) / 100) * selectedProduct.calories * 10) / 10,
        protein: Math.round((parseFloat(grams) / 100) * selectedProduct.protein * 10) / 10,
        carbohydrates: Math.round((parseFloat(grams) / 100) * selectedProduct.carbohydrates * 10) / 10,
        fats: Math.round((parseFloat(grams) / 100) * selectedProduct.fats * 10) / 10,
    } : null;

    const handleSubmit = () => {
        if (!selectedProductId || !grams) return;
        setProcessing(true);
        router.post(`/voeding-dagboek/${memberId}`, {
            food_product_id: selectedProductId,
            category: categoryKey,
            grams: grams,
        }, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setSelectedProductId('');
                setGrams('100');
                setSearch('');
            },
        });
    };

    if (!showForm) {
        return (
            <div className="px-4 py-3">
                <button
                    onClick={() => setShowForm(true)}
                    className="text-xs font-medium text-lime-500 hover:text-lime-400"
                >
                    + Product toevoegen
                </button>
            </div>
        );
    }

    return (
        <div className="px-4 py-3 bg-slate-800/20 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">Product toevoegen</p>
                <button onClick={() => { setShowForm(false); setShowNewProduct(false); }} className="text-xs text-slate-600 hover:text-slate-400">Sluiten</button>
            </div>

            {!showNewProduct ? (
                <>
                    <div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Zoek in mijn producten..."
                            className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 placeholder-slate-500 focus:ring-lime-500 focus:border-lime-500"
                        />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1">
                        {filtered.length === 0 ? (
                            <p className="text-xs text-slate-600 py-2">Geen producten gevonden</p>
                        ) : (
                            filtered.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleSelectProduct(p.id)}
                                    className={`w-full text-left rounded-md px-3 py-1.5 text-sm transition-colors ${
                                        Number(selectedProductId) === p.id
                                            ? 'bg-lime-900/30 ring-1 ring-lime-700/50 text-white'
                                            : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-300'
                                    }`}
                                >
                                    <span className="font-medium">{p.name}</span>
                                    <span className="text-xs text-slate-500 ml-2">{p.calories} kcal/100g</span>
                                    {p.pivot?.default_portion && p.pivot.default_portion !== 100 && (
                                        <span className="text-xs text-lime-600 ml-1">· {p.pivot.default_portion}g</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {selectedProduct && (
                        <div className="space-y-2">
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-500 mb-1">Hoeveelheid (gram)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="9999"
                                        step="1"
                                        value={grams}
                                        onChange={(e) => setGrams(e.target.value)}
                                        className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 focus:ring-lime-500 focus:border-lime-500"
                                    />
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="rounded-md bg-lime-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-lime-700 disabled:opacity-50"
                                >
                                    {processing ? '...' : 'Toevoegen'}
                                </button>
                            </div>
                            {preview && (
                                <p className="text-xs text-slate-500">
                                    = {preview.calories} kcal · {preview.protein}g eiwit · {preview.carbohydrates}g koolh. · {preview.fats}g vet
                                </p>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => setShowNewProduct(true)}
                        className="text-xs text-sky-500 hover:text-sky-400"
                    >
                        Product niet in je lijst? Voeg een nieuw product toe →
                    </button>
                </>
            ) : (
                <NewProductForm memberId={memberId} catalog={catalog} myProducts={myProducts} onCancel={() => setShowNewProduct(false)} />
            )}
        </div>
    );
}

/* ─── New Product Form (within diary) ─── */
function NewProductForm({ memberId, catalog, myProducts, onCancel }) {
    const [searchName, setSearchName] = useState('');
    const [form, setForm] = useState({ name: '', calories: '', protein: '', carbohydrates: '', fats: '', default_portion: '100' });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [showManualForm, setShowManualForm] = useState(false);

    // API search
    const [apiResults, setApiResults] = useState([]);
    const [apiLoading, setApiLoading] = useState(false);
    const [apiSearched, setApiSearched] = useState(false);
    const debounceRef = useRef(null);

    // Catalog matching
    const match = useMemo(() => {
        if (!searchName.trim()) return null;
        return catalog.find((p) => p.name.toLowerCase() === searchName.trim().toLowerCase()) || null;
    }, [searchName, catalog]);

    const isAlreadyInMyList = match ? myProducts.some((p) => p.id === match.id) : false;

    const partialMatches = useMemo(() => {
        if (!searchName.trim() || match) return [];
        return catalog.filter((p) => p.name.toLowerCase().includes(searchName.trim().toLowerCase())).slice(0, 5);
    }, [searchName, catalog, match]);

    // API search with debounce
    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (!searchName.trim() || searchName.trim().length < 2 || match) {
            setApiResults([]);
            setApiSearched(false);
            return;
        }
        debounceRef.current = setTimeout(() => {
            setApiLoading(true);
            setApiSearched(false);
            fetch(`/api/voeding/zoek?q=${encodeURIComponent(searchName.trim())}`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            })
                .then((r) => r.ok ? r.json() : [])
                .then((data) => { setApiResults(data); setApiSearched(true); })
                .catch(() => { setApiResults([]); setApiSearched(true); })
                .finally(() => setApiLoading(false));
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [searchName, match]);

    const handleSelectApi = (product) => {
        setForm({
            name: product.name,
            calories: String(product.calories),
            protein: String(product.protein),
            carbohydrates: String(product.carbohydrates),
            fats: String(product.fats),
            default_portion: form.default_portion,
        });
        setSearchName(product.name);
        setApiResults([]);
        setShowManualForm(true);
    };

    const handleAddExisting = (product) => {
        setProcessing(true);
        router.post(`/voeding-dagboek/${memberId}/product`, {
            name: product.name,
            default_portion: form.default_portion,
        }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="space-y-2">
            <p className="text-xs font-medium text-sky-400">Nieuw product toevoegen</p>

            <div>
                <label className="block text-xs text-slate-500 mb-1">Productnaam</label>
                <input
                    type="text"
                    value={searchName}
                    onChange={(e) => { setSearchName(e.target.value); setShowManualForm(false); }}
                    placeholder="Bijv. Bruin brood"
                    className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 placeholder-slate-500 focus:ring-sky-500 focus:border-sky-500"
                />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>

            {searchName.trim() && (
                <>
                    {/* Exact match found in catalog */}
                    {match ? (
                        <div className="rounded-lg ring-1 ring-emerald-700/30 bg-emerald-900/20 p-3">
                            <p className="text-xs font-medium text-emerald-400 mb-2">Product gevonden in catalogus</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs mb-2">
                                <span className="text-slate-400">Naam:</span>
                                <span className="text-white font-medium">{match.name}</span>
                                <span className="text-slate-400">Calorieën:</span>
                                <span className="text-slate-200">{match.calories} kcal</span>
                                <span className="text-slate-400">Eiwit:</span>
                                <span className="text-slate-200">{match.protein}g</span>
                                <span className="text-slate-400">Koolhydraten:</span>
                                <span className="text-slate-200">{match.carbohydrates}g</span>
                                <span className="text-slate-400">Vetten:</span>
                                <span className="text-slate-200">{match.fats}g</span>
                            </div>
                            {isAlreadyInMyList ? (
                                <p className="text-xs text-amber-400">Dit product staat al in je lijst. Ga terug om het te selecteren.</p>
                            ) : (
                                <div className="flex items-end gap-2">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Standaard portie (g)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="9999"
                                            step="1"
                                            value={form.default_portion}
                                            onChange={(e) => setForm({ ...form, default_portion: e.target.value })}
                                            className="w-20 rounded-md bg-slate-800 border-slate-700 text-white text-sm px-2 py-1.5 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleAddExisting(match)}
                                        disabled={processing}
                                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {processing ? '...' : 'Toevoegen aan mijn lijst'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Partial match suggestions */}
                            {partialMatches.length > 0 && (
                                <div className="rounded-lg ring-1 ring-amber-700/30 bg-amber-900/20 p-2">
                                    <p className="text-xs font-medium text-amber-400 mb-1">Bedoelde je misschien:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {partialMatches.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => setSearchName(s.name)}
                                                className="rounded-full bg-amber-800/40 px-2 py-0.5 text-xs text-amber-200 hover:bg-amber-700/50 transition-colors"
                                            >
                                                {s.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* API search results */}
                            {apiLoading && <p className="text-xs text-sky-400">Zoeken in voedingsdatabases...</p>}

                            {!apiLoading && apiResults.length > 0 && (
                                <div className="rounded-lg ring-1 ring-sky-700/30 bg-sky-900/20 p-2">
                                    <p className="text-xs font-medium text-sky-400 mb-1">Resultaten uit voedingsdatabase <span className="text-sky-600">(per 100g)</span></p>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {apiResults.map((p, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleSelectApi(p)}
                                                className="w-full text-left rounded-md bg-sky-900/30 hover:bg-sky-800/40 px-3 py-1.5 ring-1 ring-sky-800/30 transition-colors"
                                            >
                                                <p className="text-xs text-white font-medium truncate">{p.name}</p>
                                                <p className="text-xs text-sky-300/70">{p.calories} kcal · {p.protein}g eiwit · {p.carbohydrates}g koolh. · {p.fats}g vet</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!apiLoading && apiSearched && apiResults.length === 0 && (
                                <p className="text-xs text-slate-600">Geen resultaten in voedingsdatabases.</p>
                            )}

                            {/* Manual creation form */}
                            {(showManualForm || (apiSearched && !apiLoading)) && (
                                <div className="rounded-lg ring-1 ring-slate-700 bg-slate-800/50 p-3">
                                    <p className="text-xs font-medium text-slate-400 mb-2">
                                        Voedingswaarden invullen (per 100g)
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { key: 'calories', label: 'Calorieën (kcal)' },
                                            { key: 'protein', label: 'Eiwit (g)' },
                                            { key: 'carbohydrates', label: 'Koolhydraten (g)' },
                                            { key: 'fats', label: 'Vetten (g)' },
                                        ].map(({ key, label }) => (
                                            <div key={key}>
                                                <label className="block text-xs text-slate-500 mb-1">{label}</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={form[key]}
                                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                                    className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5"
                                                />
                                                {errors[key] && <p className="text-xs text-red-400 mt-1">{errors[key]}</p>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-xs text-slate-500 mb-1">Standaard portie (g)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="9999"
                                            step="1"
                                            value={form.default_portion}
                                            onChange={(e) => setForm({ ...form, default_portion: e.target.value })}
                                            className="w-28 rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => {
                                                const submitData = { ...form, name: searchName.trim() };
                                                setForm(submitData);
                                                setProcessing(true);
                                                setErrors({});
                                                router.post(`/voeding-dagboek/${memberId}/product`, submitData, {
                                                    preserveScroll: true,
                                                    onError: (errs) => setErrors(errs),
                                                    onFinish: () => setProcessing(false),
                                                });
                                            }}
                                            disabled={processing}
                                            className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
                                        >
                                            {processing ? 'Bezig...' : 'Aanmaken & Toevoegen'}
                                        </button>
                                        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-400 px-2">
                                            Annuleren
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {!searchName.trim() && (
                <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-400">
                    ← Terug naar producten
                </button>
            )}
        </div>
    );
}
