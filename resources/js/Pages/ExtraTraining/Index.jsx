import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { useState } from 'react';

export default function Index({ extraTrainings, groups, trainers, isAdmin }) {
    const prefix = isAdmin ? '/admin' : '/trainer';
    const [editingId, setEditingId] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    const isFuture = (dateStr) => (dateStr ? dateStr.substring(0, 10) : '') >= today;

    const { data, setData, patch, processing, errors, reset } = useForm({
        name: '',
        date: '',
        start_time: '',
        end_time: '',
        trainer_id: '',
        training_group_ids: [],
    });

    const startEdit = (training) => {
        setEditingId(training.id);
        setData({
            name: training.name || '',
            date: training.date ? training.date.substring(0, 10) : '',
            start_time: training.start_time ? training.start_time.substring(0, 5) : '',
            end_time: training.end_time ? training.end_time.substring(0, 5) : '',
            trainer_id: training.trainer_id || '',
            training_group_ids: training.training_groups?.map(g => g.id) || [],
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const handleUpdate = (e, id) => {
        e.preventDefault();
        patch(`${prefix}/extra-training/${id}`, {
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Weet je zeker dat je deze extra training wilt verwijderen?')) return;
        router.delete(`${prefix}/extra-training/${id}`, { preserveScroll: true });
    };

    const toggleGroup = (id) => {
        setData('training_group_ids',
            data.training_group_ids.includes(id)
                ? data.training_group_ids.filter(g => g !== id)
                : [...data.training_group_ids, id]
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '—';
        return timeStr.substring(0, 5);
    };

    return (
        <AppLayout>
            <Head title="Extra Trainingen" />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">Extra Trainingen</h1>
                    <Link
                        href={`${prefix}/extra-training/create`}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-all"
                    >
                        + Aanmaken
                    </Link>
                </div>

                {extraTrainings.length === 0 ? (
                    <div className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-8 text-center">
                        <p className="text-slate-400">Geen extra trainingen gevonden.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {extraTrainings.map((training) => {
                            const future = isFuture(training.date);
                            const isEditing = editingId === training.id;

                            if (isEditing) {
                                return (
                                    <div key={training.id} className="rounded-xl bg-slate-800/80 border border-rose-500/30 p-5">
                                        <form onSubmit={(e) => handleUpdate(e, training.id)} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-300 mb-1">Naam</label>
                                                    <input
                                                        type="text"
                                                        value={data.name}
                                                        onChange={e => setData('name', e.target.value)}
                                                        className="w-full rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                                    />
                                                    {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-300 mb-1">Datum</label>
                                                    <input
                                                        type="date"
                                                        value={data.date}
                                                        onChange={e => setData('date', e.target.value)}
                                                        className="w-full rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                                    />
                                                    {errors.date && <p className="text-sm text-red-400 mt-1">{errors.date}</p>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-300 mb-1">Starttijd</label>
                                                    <input
                                                        type="time"
                                                        value={data.start_time}
                                                        onChange={e => setData('start_time', e.target.value)}
                                                        className="w-full rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                                    />
                                                    {errors.start_time && <p className="text-sm text-red-400 mt-1">{errors.start_time}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-300 mb-1">Eindtijd</label>
                                                    <input
                                                        type="time"
                                                        value={data.end_time}
                                                        onChange={e => setData('end_time', e.target.value)}
                                                        className="w-full rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                                    />
                                                    {errors.end_time && <p className="text-sm text-red-400 mt-1">{errors.end_time}</p>}
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <label className="block text-sm font-medium text-slate-300 mb-1">Trainer</label>
                                                    <select
                                                        value={data.trainer_id}
                                                        onChange={e => setData('trainer_id', e.target.value)}
                                                        className="w-full rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                                    >
                                                        <option value="">— Kies trainer —</option>
                                                        {trainers.map(t => (
                                                            <option key={t.id} value={t.id}>{t.name}</option>
                                                        ))}
                                                    </select>
                                                    {errors.trainer_id && <p className="text-sm text-red-400 mt-1">{errors.trainer_id}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">Trainingsgroepen</label>
                                                {errors.training_group_ids && <p className="text-sm text-red-400 mb-2">{errors.training_group_ids}</p>}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {groups.map(g => (
                                                        <button
                                                            key={g.id}
                                                            type="button"
                                                            onClick={() => toggleGroup(g.id)}
                                                            className={`rounded-lg px-3 py-2 text-sm font-medium text-left transition-all ${
                                                                data.training_group_ids.includes(g.id)
                                                                    ? 'bg-rose-900/50 text-rose-300 ring-2 ring-rose-500'
                                                                    : 'bg-slate-900 text-slate-300 ring-1 ring-slate-700 hover:ring-slate-600'
                                                            }`}
                                                        >
                                                            {data.training_group_ids.includes(g.id) && <span className="mr-1">✓</span>}
                                                            {g.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-all"
                                                >
                                                    {processing ? 'Bezig...' : 'Opslaan'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEdit}
                                                    className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-600 transition-all"
                                                >
                                                    Annuleren
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={training.id}
                                    className={`rounded-xl border p-4 ${
                                        future
                                            ? 'bg-slate-800/60 border-slate-700/50'
                                            : 'bg-slate-800/30 border-slate-700/30 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-white font-semibold truncate">{training.name || 'Extra training'}</h3>
                                                {!future && (
                                                    <span className="shrink-0 text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">Verlopen</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                                                <span>{formatDate(training.date)}</span>
                                                <span>{formatTime(training.start_time)}{training.end_time ? ` – ${formatTime(training.end_time)}` : ''}</span>
                                                {training.trainer && <span>Trainer: {training.trainer.name}</span>}
                                            </div>
                                            {training.training_groups?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {training.training_groups.map(g => (
                                                        <span key={g.id} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full">
                                                            {g.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {future && (
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => startEdit(training)}
                                                    className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-600 transition-all"
                                                >
                                                    Bewerken
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(training.id)}
                                                    className="rounded-lg bg-red-900/50 px-3 py-1.5 text-sm text-red-300 hover:bg-red-900/70 transition-all"
                                                >
                                                    Verwijderen
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
