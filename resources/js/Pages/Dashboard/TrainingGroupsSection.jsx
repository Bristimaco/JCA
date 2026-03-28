import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function TrainingGroupsSection({ trainingGroups, trainers, allMembers }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [managingMembersId, setManagingMembersId] = useState(null);

    return (
        <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                    Trainingsgroepen
                    <span className="ml-2 inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                        {trainingGroups.length}
                    </span>
                </h2>
                <button
                    onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
                >
                    {showAddForm ? 'Annuleren' : 'Toevoegen'}
                </button>
            </div>

            {showAddForm && (
                <TrainingGroupForm
                    trainers={trainers}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {trainingGroups.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500">
                    Geen trainingsgroepen. Maak een nieuwe groep aan.
                </div>
            ) : (
                <div className="divide-y divide-slate-700">
                    {trainingGroups.map((group) => (
                        <div key={group.id}>
                            {editingId === group.id ? (
                                <TrainingGroupForm
                                    group={group}
                                    trainers={trainers}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <TrainingGroupRow
                                    group={group}
                                    onEdit={() => { setEditingId(group.id); setManagingMembersId(null); setShowAddForm(false); }}
                                    onManageMembers={() => { setManagingMembersId(managingMembersId === group.id ? null : group.id); setEditingId(null); setShowAddForm(false); }}
                                    isManagingMembers={managingMembersId === group.id}
                                />
                            )}
                            {managingMembersId === group.id && editingId !== group.id && (
                                <MemberAssignment
                                    group={group}
                                    allMembers={allMembers}
                                    onClose={() => setManagingMembersId(null)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function TrainingGroupForm({ group, trainers, onCancel }) {
    const isEditing = !!group;
    const form = useForm({
        name: group?.name || '',
        description: group?.description || '',
        membership_fee: group?.membership_fee || '',
        membership_fee_discount: group?.membership_fee_discount || '0',
        schedules: group?.schedules?.length ? group.schedules.map(s => ({ day: s.day, start_time: s.start_time, end_time: s.end_time || '' })) : [{ day: '', start_time: '', end_time: '' }],
        location: group?.location || '',
        trainer_id: group?.trainer_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...form.data,
            schedules: form.data.schedules.filter(s => s.day && s.start_time),
        };
        if (isEditing) {
            form.transform(() => data).patch(`/admin/training-groups/${group.id}`, {
                preserveScroll: true,
                onSuccess: () => onCancel(),
            });
        } else {
            form.transform(() => data).post('/admin/training-groups', {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onCancel();
                },
            });
        }
    };

    const days = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

    const addSchedule = () => {
        form.setData('schedules', [...form.data.schedules, { day: '', start_time: '', end_time: '' }]);
    };

    const removeSchedule = (index) => {
        form.setData('schedules', form.data.schedules.filter((_, i) => i !== index));
    };

    const updateSchedule = (index, field, value) => {
        const updated = form.data.schedules.map((s, i) => i === index ? { ...s, [field]: value } : s);
        form.setData('schedules', updated);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-800/50 border-b border-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Naam *</label>
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="bijv. Competitie"
                    />
                    {form.errors.name && <p className="text-xs text-red-400 mt-1">{form.errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Lidgeld (€) *</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.data.membership_fee}
                        onChange={(e) => form.setData('membership_fee', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="0.00"
                    />
                    {form.errors.membership_fee && <p className="text-xs text-red-400 mt-1">{form.errors.membership_fee}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Korting extra lid (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.data.membership_fee_discount}
                        onChange={(e) => form.setData('membership_fee_discount', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="0.00"
                    />
                    {form.errors.membership_fee_discount && <p className="text-xs text-red-400 mt-1">{form.errors.membership_fee_discount}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Locatie</label>
                    <input
                        type="text"
                        value={form.data.location}
                        onChange={(e) => form.setData('location', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="bijv. Sporthal De Brug"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Trainer</label>
                    <select
                        value={form.data.trainer_id}
                        onChange={(e) => form.setData('trainer_id', e.target.value || '')}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                        <option value="">Geen trainer</option>
                        {trainers.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Beschrijving</label>
                    <textarea
                        value={form.data.description}
                        onChange={(e) => form.setData('description', e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Optionele beschrijving..."
                    />
                </div>
            </div>

            {/* Trainingsmomenten */}
            <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-slate-400">Trainingsmomenten</label>
                    <button
                        type="button"
                        onClick={addSchedule}
                        className="text-xs font-medium text-rose-400 hover:text-rose-300"
                    >
                        + Moment toevoegen
                    </button>
                </div>
                <div className="space-y-2">
                    {form.data.schedules.map((schedule, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <select
                                value={schedule.day}
                                onChange={(e) => updateSchedule(index, 'day', e.target.value)}
                                className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            >
                                <option value="">Dag...</option>
                                {days.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={schedule.start_time}
                                onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
                                className="w-24 rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                placeholder="Van"
                            />
                            <input
                                type="text"
                                value={schedule.end_time}
                                onChange={(e) => updateSchedule(index, 'end_time', e.target.value)}
                                className="w-24 rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                placeholder="Tot"
                            />
                            {form.data.schedules.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSchedule(index)}
                                    className="text-red-400 hover:text-red-300 text-sm px-1"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-md bg-rose-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                    {isEditing ? 'Opslaan' : 'Aanmaken'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md bg-slate-700/50 border border-slate-600 px-4 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50"
                >
                    Annuleren
                </button>
            </div>
        </form>
    );
}

function TrainingGroupRow({ group, onEdit, onManageMembers, isManagingMembers }) {
    const deleteForm = useForm({});

    const handleDelete = () => {
        if (confirm(`Weet je zeker dat je de groep "${group.name}" wilt verwijderen?`)) {
            deleteForm.delete(`/admin/training-groups/${group.id}`, { preserveScroll: true });
        }
    };

    return (
        <div className="px-6 py-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-white">{group.name}</p>
                        <span className="inline-flex items-center rounded-full bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-400">
                            €{Number(group.membership_fee).toFixed(2)}
                        </span>
                        {Number(group.membership_fee_discount) > 0 && (
                            <span className="inline-flex items-center rounded-full bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-400">
                                -€{Number(group.membership_fee_discount).toFixed(2)} korting
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-slate-400">
                        {group.schedules?.length > 0 && (
                            <span>
                                {group.schedules.map((s, i) => (
                                    <span key={i}>
                                        {i > 0 && ', '}
                                        {s.day} {s.start_time}{s.end_time ? `–${s.end_time}` : ''}
                                    </span>
                                ))}
                            </span>
                        )}
                        {group.location && <span>{group.location}</span>}
                        {group.trainer_name && <span>Trainer: {group.trainer_name}</span>}
                        <span>{group.member_count} {group.member_count === 1 ? 'lid' : 'leden'}</span>
                    </div>
                    {group.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{group.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={onManageMembers}
                        className={`text-sm ${isManagingMembers ? 'text-emerald-300' : 'text-emerald-600 hover:text-emerald-400'}`}
                    >
                        Leden
                    </button>
                    <button onClick={onEdit} className="text-sm text-rose-400 hover:text-rose-300">
                        Bewerken
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleteForm.processing}
                        className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                        Verwijderen
                    </button>
                </div>
            </div>
        </div>
    );
}

function MemberAssignment({ group, allMembers, onClose }) {
    const form = useForm({
        member_ids: group.member_ids || [],
    });

    const handleSave = () => {
        form.put(`/admin/training-groups/${group.id}/members`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-700">
            <p className="text-xs font-medium text-slate-400 mb-2">Leden in {group.name}</p>
            <div className="flex flex-wrap gap-2 mb-3">
                {form.data.member_ids.map((mid) => {
                    const m = allMembers.find((am) => am.id === mid);
                    return m ? (
                        <span key={mid} className="inline-flex items-center gap-1 rounded-full bg-rose-900/30 px-2.5 py-0.5 text-xs font-medium text-rose-300">
                            {m.name}
                            <button
                                type="button"
                                onClick={() => form.setData('member_ids', form.data.member_ids.filter((id) => id !== mid))}
                                className="text-rose-400 hover:text-rose-200 ml-0.5"
                            >
                                &times;
                            </button>
                        </span>
                    ) : null;
                })}
                {form.data.member_ids.length === 0 && (
                    <span className="text-xs text-slate-500">Geen leden in deze groep</span>
                )}
            </div>
            <div className="flex items-center gap-2">
                <select
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val && !form.data.member_ids.includes(val)) {
                            form.setData('member_ids', [...form.data.member_ids, val]);
                        }
                        e.target.value = '';
                    }}
                    className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                    <option value="">Lid toevoegen...</option>
                    {allMembers.filter((am) => !form.data.member_ids.includes(am.id)).map((am) => (
                        <option key={am.id} value={am.id}>{am.name}</option>
                    ))}
                </select>
                <button
                    type="button"
                    disabled={form.processing}
                    onClick={handleSave}
                    className="rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                    Opslaan
                </button>
                <button
                    type="button"
                    onClick={() => { form.setData('member_ids', group.member_ids || []); onClose(); }}
                    className="rounded-md bg-slate-700/50 border border-slate-600 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700/50"
                >
                    Annuleren
                </button>
            </div>
        </div>
    );
}
