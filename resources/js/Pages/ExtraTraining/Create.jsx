import { Head, router, useForm, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function Create({ groups, trainers }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        date: '',
        start_time: '',
        end_time: '',
        trainer_id: '',
        training_group_ids: [],
    });

    const toggleGroup = (id) => {
        setData('training_group_ids',
            data.training_group_ids.includes(id)
                ? data.training_group_ids.filter(g => g !== id)
                : [...data.training_group_ids, id]
        );
    };

    const isAdmin = window.location.pathname.startsWith('/admin');
    const submitUrl = isAdmin ? '/admin/extra-training' : '/trainer/extra-training';
    const backUrl = isAdmin ? '/admin/extra-training' : '/trainer/extra-training';

    const handleSubmit = (e) => {
        e.preventDefault();
        post(submitUrl);
    };

    return (
        <AppLayout>
            <Head title="Extra Training Aanmaken" />

            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">Extra Training Aanmaken</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Naam</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="bijv. Techniektraining"
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                        {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name}</p>}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Datum</label>
                        <input
                            type="date"
                            value={data.date}
                            onChange={e => setData('date', e.target.value)}
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                        {errors.date && <p className="text-sm text-red-400 mt-1">{errors.date}</p>}
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Starttijd</label>
                            <input
                                type="time"
                                value={data.start_time}
                                onChange={e => setData('start_time', e.target.value)}
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            />
                            {errors.start_time && <p className="text-sm text-red-400 mt-1">{errors.start_time}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Eindtijd</label>
                            <input
                                type="time"
                                value={data.end_time}
                                onChange={e => setData('end_time', e.target.value)}
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            />
                            {errors.end_time && <p className="text-sm text-red-400 mt-1">{errors.end_time}</p>}
                        </div>
                    </div>

                    {/* Trainer */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Trainer</label>
                        <select
                            value={data.trainer_id}
                            onChange={e => setData('trainer_id', e.target.value)}
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        >
                            <option value="">— Kies trainer —</option>
                            {trainers.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        {errors.trainer_id && <p className="text-sm text-red-400 mt-1">{errors.trainer_id}</p>}
                    </div>

                    {/* Training Groups */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Trainingsgroepen</label>
                        {errors.training_group_ids && <p className="text-sm text-red-400 mb-2">{errors.training_group_ids}</p>}
                        <div className="grid grid-cols-2 gap-2">
                            {groups.map(g => (
                                <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => toggleGroup(g.id)}
                                    className={`rounded-lg px-4 py-3 text-sm font-medium text-left transition-all ${
                                        data.training_group_ids.includes(g.id)
                                            ? 'bg-rose-900/50 text-rose-300 ring-2 ring-rose-500'
                                            : 'bg-slate-800 text-slate-300 ring-1 ring-slate-700 hover:ring-slate-600'
                                    }`}
                                >
                                    {data.training_group_ids.includes(g.id) && (
                                        <span className="mr-2">✓</span>
                                    )}
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-all"
                        >
                            {processing ? 'Bezig...' : 'Aanmaken'}
                        </button>
                        <Link
                            href={backUrl}
                            className="rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700"
                        >
                            Annuleren
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
