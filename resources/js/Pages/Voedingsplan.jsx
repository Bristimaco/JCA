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
