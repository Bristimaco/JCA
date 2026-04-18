import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';

export default function Voedingsplan({ members }) {
    const { flash } = usePage().props;
    const [selectedId, setSelectedId] = useState(members[0]?.id || null);
    const selected = members.find((m) => m.id === selectedId);

    if (members.length === 0) {
        return (
            <AppLayout>
                <Head title="Voedingsplan" />
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-stone-100 tracking-tight">Voedingsplan</h1>
                        <p className="text-slate-400 text-xs">Stel een dagelijks voedingsplan in per lid</p>
                    </div>
                    <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                        &larr; Dashboard
                    </Link>
                </div>
                <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-700/60 border-t-2 border-t-lime-700 px-6 py-8 text-center text-slate-500 text-sm">
                    Je hebt geen gekoppelde leden. Vraag een beheerder om je account aan een lid te koppelen.
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Voedingsplan" />

            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-stone-100 tracking-tight">Voedingsplan</h1>
                    <p className="text-slate-400 text-xs">Stel een dagelijks voedingsplan in per lid</p>
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

            {/* Member selector (only show if multiple) */}
            {members.length > 1 && (
                <div className="mb-4 flex gap-2 flex-wrap">
                    {members.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedId(m.id)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                m.id === selectedId
                                    ? 'bg-lime-600 text-white ring-2 ring-lime-400'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700'
                            }`}
                        >
                            {m.name}
                        </button>
                    ))}
                </div>
            )}

            {selected && <PlanForm key={selected.id} member={selected} />}
            {selected && <TrainingTypesSection key={`tt-${selected.id}`} member={selected} />}
        </AppLayout>
    );
}

function PlanForm({ member }) {
    const plan = member.nutrition_plan;
    const form = useForm({
        min_calories: plan?.min_calories ?? '',
        max_calories: plan?.max_calories ?? '',
        min_protein: plan?.min_protein ?? '',
        max_protein: plan?.max_protein ?? '',
        min_carbohydrates: plan?.min_carbohydrates ?? '',
        max_carbohydrates: plan?.max_carbohydrates ?? '',
        min_fats: plan?.min_fats ?? '',
        max_fats: plan?.max_fats ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(`/voedingsplan/${member.id}`, { preserveScroll: true });
    };

    const fields = [
        { label: 'Calorieën (kcal)', minKey: 'min_calories', maxKey: 'max_calories', required: true },
        { label: 'Eiwit (g)', minKey: 'min_protein', maxKey: 'max_protein', required: false },
        { label: 'Koolhydraten (g)', minKey: 'min_carbohydrates', maxKey: 'max_carbohydrates', required: false },
        { label: 'Vetten (g)', minKey: 'min_fats', maxKey: 'max_fats', required: false },
    ];

    return (
        <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-700/60 border-t-2 border-t-lime-700">
            <div className="px-6 py-4 border-b border-slate-800/60">
                <h2 className="text-lg font-semibold text-white">{member.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Dagelijkse doelen — min. en max. per macronutriënt</p>
            </div>

            <form onSubmit={handleSubmit} className="px-3 sm:px-6 py-4">
                <div className="space-y-4">
                    {fields.map(({ label, minKey, maxKey, required }) => (
                        <div key={minKey}>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                {label}
                                {required
                                    ? <span className="text-red-400 ml-1">*</span>
                                    : <span className="text-slate-600 text-xs ml-1.5">(optioneel)</span>
                                }
                            </label>
                            <div className="grid grid-cols-2 gap-3 max-w-md">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Minimum</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.data[minKey]}
                                        onChange={(e) => form.setData(minKey, e.target.value)}
                                        className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 focus:ring-lime-500 focus:border-lime-500"
                                    />
                                    {form.errors[minKey] && <p className="text-xs text-red-400 mt-1">{form.errors[minKey]}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Maximum</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={form.data[maxKey]}
                                        onChange={(e) => form.setData(maxKey, e.target.value)}
                                        className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 focus:ring-lime-500 focus:border-lime-500"
                                    />
                                    {form.errors[maxKey] && <p className="text-xs text-red-400 mt-1">{form.errors[maxKey]}</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-md bg-lime-600 px-5 py-2 text-sm font-medium text-white hover:bg-lime-700 disabled:opacity-50"
                    >
                        {form.processing ? 'Bezig...' : 'Opslaan'}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ─── Training Types Section ─── */
function TrainingTypesSection({ member }) {
    const types = member.training_types || [];
    const [adding, setAdding] = useState(false);

    return (
        <div className="mt-6 bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-700/60 border-t-2 border-t-orange-700">
            <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-white">Trainingstypes</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Extra nutriënten per type training — worden opgeteld bij de dagdoelen</p>
                </div>
                <button
                    onClick={() => setAdding(!adding)}
                    className="rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700"
                >
                    {adding ? 'Annuleren' : '+ Type toevoegen'}
                </button>
            </div>

            <div className="divide-y divide-slate-800/60">
                {adding && <NewTrainingTypeForm memberId={member.id} onDone={() => setAdding(false)} />}
                {types.map((tt) => (
                    <TrainingTypeRow key={tt.id} tt={tt} memberId={member.id} />
                ))}
                {types.length === 0 && !adding && (
                    <div className="px-6 py-6 text-center text-sm text-slate-500">
                        Nog geen trainingstypes. Klik op &ldquo;+ Type toevoegen&rdquo; om te beginnen.
                    </div>
                )}
            </div>
        </div>
    );
}

function NewTrainingTypeForm({ memberId, onDone }) {
    const form = useForm({
        name: '',
        surplus_calories: '',
        surplus_protein: '',
        surplus_carbohydrates: '',
        surplus_fats: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(`/voedingsplan/${memberId}/training-types`, {
            preserveScroll: true,
            onSuccess: () => { form.reset(); onDone(); },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="px-3 sm:px-6 py-4 bg-slate-800/30">
            <div className="mb-3">
                <label className="block text-sm font-medium text-slate-300 mb-1">Naam</label>
                <input
                    type="text"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    placeholder="bv. Krachttraining, Cardio..."
                    className="w-full max-w-sm rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 focus:ring-orange-500 focus:border-orange-500"
                />
                {form.errors.name && <p className="text-xs text-red-400 mt-1">{form.errors.name}</p>}
            </div>
            <SurplusFields form={form} />
            <button
                type="submit"
                disabled={form.processing || !form.data.name}
                className="mt-3 rounded-md bg-orange-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
                Toevoegen
            </button>
        </form>
    );
}

function TrainingTypeRow({ tt, memberId }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({
        surplus_calories: tt.surplus_calories ?? '',
        surplus_protein: tt.surplus_protein ?? '',
        surplus_carbohydrates: tt.surplus_carbohydrates ?? '',
        surplus_fats: tt.surplus_fats ?? '',
    });
    const deleteForm = useForm({});

    const handleSave = (e) => {
        e.preventDefault();
        form.patch(`/voedingsplan/${memberId}/training-types/${tt.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const handleDelete = () => {
        deleteForm.delete(`/voedingsplan/${memberId}/training-types/${tt.id}`, {
            preserveScroll: true,
        });
    };

    if (editing) {
        return (
            <form onSubmit={handleSave} className="px-3 sm:px-6 py-4 bg-slate-800/30">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-white">{tt.name}</span>
                    {tt.is_default && <span className="text-xs bg-orange-900/40 text-orange-400 px-2 py-0.5 rounded-full">Standaard</span>}
                </div>
                <SurplusFields form={form} />
                <div className="mt-3 flex gap-2">
                    <button type="submit" disabled={form.processing} className="rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50">
                        Opslaan
                    </button>
                    <button type="button" onClick={() => { form.reset(); setEditing(false); }} className="rounded-md bg-slate-700/50 border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/80">
                        Annuleren
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="px-3 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{tt.name}</span>
                    {tt.is_default && <span className="text-xs bg-orange-900/40 text-orange-400 px-2 py-0.5 rounded-full">Standaard</span>}
                </div>
                <div className="flex gap-3 mt-0.5 text-xs text-slate-500">
                    <span>+{tt.surplus_calories} kcal</span>
                    {tt.surplus_protein != null && <span>+{tt.surplus_protein}g eiwit</span>}
                    {tt.surplus_carbohydrates != null && <span>+{tt.surplus_carbohydrates}g koolh.</span>}
                    {tt.surplus_fats != null && <span>+{tt.surplus_fats}g vet</span>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setEditing(true)} className="text-sm text-orange-400 hover:text-orange-300">
                    Bewerken
                </button>
                {!tt.is_default && (
                    <button onClick={handleDelete} disabled={deleteForm.processing} className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50">
                        Verwijderen
                    </button>
                )}
            </div>
        </div>
    );
}

function SurplusFields({ form }) {
    const fields = [
        { label: 'Extra calorieën (kcal)', key: 'surplus_calories', required: true },
        { label: 'Extra eiwit (g)', key: 'surplus_protein', required: false },
        { label: 'Extra koolhydraten (g)', key: 'surplus_carbohydrates', required: false },
        { label: 'Extra vetten (g)', key: 'surplus_fats', required: false },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {fields.map(({ label, key, required }) => (
                <div key={key}>
                    <label className="block text-xs text-slate-500 mb-1">
                        {label}
                        {required ? <span className="text-red-400 ml-0.5">*</span> : <span className="text-slate-600 ml-1">(opt.)</span>}
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={form.data[key]}
                        onChange={(e) => form.setData(key, e.target.value)}
                        className="w-full rounded-md bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {form.errors[key] && <p className="text-xs text-red-400 mt-1">{form.errors[key]}</p>}
                </div>
            ))}
        </div>
    );
}
