import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function TrainingGroups({ groups, allMembers, isAdmin, trainers }) {
    const [managingId, setManagingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    return (
        <AppLayout>
            <Head title="Trainingsgroepen" />
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">Trainingsgroepen</h1>
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <button
                                onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }}
                                className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
                            >
                                {showAddForm ? 'Annuleren' : 'Toevoegen'}
                            </button>
                        )}
                        <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                            ← Dashboard
                        </Link>
                    </div>
                </div>

                {showAddForm && isAdmin && (
                    <div className="mb-4">
                        <TrainingGroupForm trainers={trainers} onCancel={() => setShowAddForm(false)} />
                    </div>
                )}

                {groups.length === 0 ? (
                    <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-8 text-center">
                        <p className="text-slate-400">
                            {isAdmin ? 'Nog geen trainingsgroepen. Maak een nieuwe groep aan.' : 'Je hebt nog geen trainingsgroepen toegewezen.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groups.map((group) => (
                            <div key={group.id} className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                                {editingId === group.id && isAdmin ? (
                                    <TrainingGroupForm group={group} trainers={trainers} onCancel={() => setEditingId(null)} />
                                ) : (
                                    <div className="px-3 sm:px-6 py-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-semibold text-white text-lg">{group.name}</p>
                                                    <span className="inline-flex items-center rounded-full bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-400">
                                                        €{Number(group.membership_fee).toFixed(2)}
                                                    </span>
                                                    {isAdmin && Number(group.membership_fee_discount) > 0 && (
                                                        <span className="inline-flex items-center rounded-full bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-400">
                                                            -€{Number(group.membership_fee_discount).toFixed(2)} korting
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-sm text-slate-400">
                                                    {group.schedules?.length > 0 && (
                                                        <span>
                                                            {group.schedules.map((s, i) => (
                                                                <span key={i}>
                                                                    {i > 0 && ', '}
                                                                    {s.day} {s.start_time}{s.end_time ? `–${s.end_time}` : ''}{s.trainer_name ? ` (${s.trainer_name})` : ''}
                                                                </span>
                                                            ))}
                                                        </span>
                                                    )}
                                                    {group.location && <span>{group.location}</span>}
                                                </div>
                                                {group.description && (
                                                    <p className="text-xs text-slate-500 mt-1">{group.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className="text-sm text-slate-400">{group.member_count} {group.member_count === 1 ? 'lid' : 'leden'}</span>
                                                <button
                                                    onClick={() => { setManagingId(managingId === group.id ? null : group.id); setEditingId(null); }}
                                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${managingId === group.id
                                                        ? 'bg-rose-600 text-white'
                                                        : 'bg-slate-800 text-rose-400 hover:bg-slate-700 ring-1 ring-slate-700'
                                                        }`}
                                                >
                                                    Leden beheren
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            onClick={() => { setEditingId(group.id); setManagingId(null); setShowAddForm(false); }}
                                                            className="text-sm text-rose-400 hover:text-rose-300"
                                                        >
                                                            Bewerken
                                                        </button>
                                                        <DeleteButton groupId={group.id} groupName={group.name} />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {managingId === group.id && editingId !== group.id && (
                                    <MemberAssignment
                                        group={group}
                                        allMembers={allMembers}
                                        isAdmin={isAdmin}
                                        onClose={() => setManagingId(null)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function DeleteButton({ groupId, groupName }) {
    const form = useForm({});
    const handleDelete = () => {
        if (confirm(`Weet je zeker dat je de groep "${groupName}" wilt verwijderen?`)) {
            form.delete(`/admin/training-groups/${groupId}`, { preserveScroll: true });
        }
    };
    return (
        <button onClick={handleDelete} disabled={form.processing} className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50">
            Verwijderen
        </button>
    );
}

function TrainingGroupForm({ group, trainers, onCancel }) {
    const isEditing = !!group;
    const form = useForm({
        name: group?.name || '',
        description: group?.description || '',
        membership_fee: group?.membership_fee || '',
        membership_fee_discount: group?.membership_fee_discount || '0',
        schedules: group?.schedules?.length ? group.schedules.map(s => ({ day: s.day, start_time: s.start_time, end_time: s.end_time || '', trainer_id: s.trainer_id || '' })) : [{ day: '', start_time: '', end_time: '', trainer_id: '' }],
        location: group?.location || '',
        allow_external_members: group?.allow_external_members || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...form.data,
            schedules: form.data.schedules.filter(s => s.day && s.start_time).map(s => ({ ...s, trainer_id: s.trainer_id || null })),
        };
        form.transform(() => data);
        if (isEditing) {
            form.patch(`/admin/training-groups/${group.id}`, { preserveScroll: true, onSuccess: () => onCancel() });
        } else {
            form.post('/admin/training-groups', { preserveScroll: true, onSuccess: () => { form.reset(); onCancel(); } });
        }
    };

    const days = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-800/50 rounded-xl ring-1 ring-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Naam *</label>
                    <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" placeholder="bijv. Competitie" />
                    {form.errors.name && <p className="text-xs text-red-400 mt-1">{form.errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Lidgeld (€) *</label>
                    <input type="number" step="0.01" min="0" value={form.data.membership_fee} onChange={(e) => form.setData('membership_fee', e.target.value)} className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" placeholder="0.00" />
                    {form.errors.membership_fee && <p className="text-xs text-red-400 mt-1">{form.errors.membership_fee}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Korting extra lid (€)</label>
                    <input type="number" step="0.01" min="0" value={form.data.membership_fee_discount} onChange={(e) => form.setData('membership_fee_discount', e.target.value)} className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" placeholder="0.00" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Locatie</label>
                    <input type="text" value={form.data.location} onChange={(e) => form.setData('location', e.target.value)} className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" placeholder="bijv. Sporthal De Brug" />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Beschrijving</label>
                    <textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={2} className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" placeholder="Optionele beschrijving..." />
                </div>
                <div className="flex items-center gap-3">
                    <input type="checkbox" id="allow_external" checked={form.data.allow_external_members} onChange={(e) => form.setData('allow_external_members', e.target.checked)} className="rounded border border-slate-600 bg-slate-700/50 text-rose-600 focus:ring-2 focus:ring-rose-500" />
                    <label htmlFor="allow_external" className="text-xs font-medium text-slate-400">Gasten van andere clubs toestaan</label>
                </div>
            </div>

            <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-slate-400">Trainingsmomenten</label>
                    <button type="button" onClick={() => form.setData('schedules', [...form.data.schedules, { day: '', start_time: '', end_time: '', trainer_id: '' }])} className="text-xs font-medium text-rose-400 hover:text-rose-300">+ Moment toevoegen</button>
                </div>
                <div className="space-y-2">
                    {form.data.schedules.map((schedule, index) => (
                        <div key={index} className="flex items-center gap-2 flex-wrap">
                            <select value={schedule.day} onChange={(e) => { const u = form.data.schedules.map((s, i) => i === index ? { ...s, day: e.target.value } : s); form.setData('schedules', u); }} className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500">
                                <option value="">Dag...</option>
                                {days.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <input type="text" value={schedule.start_time} onChange={(e) => { const u = form.data.schedules.map((s, i) => i === index ? { ...s, start_time: e.target.value } : s); form.setData('schedules', u); }} className="w-24 rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="Van" />
                            <input type="text" value={schedule.end_time} onChange={(e) => { const u = form.data.schedules.map((s, i) => i === index ? { ...s, end_time: e.target.value } : s); form.setData('schedules', u); }} className="w-24 rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="Tot" />
                            <select value={schedule.trainer_id} onChange={(e) => { const u = form.data.schedules.map((s, i) => i === index ? { ...s, trainer_id: e.target.value || '' } : s); form.setData('schedules', u); }} className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500">
                                <option value="">Trainer...</option>
                                {(trainers || []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            {form.data.schedules.length > 1 && (
                                <button type="button" onClick={() => form.setData('schedules', form.data.schedules.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300 text-sm px-1">&times;</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                <button type="submit" disabled={form.processing} className="rounded-md bg-rose-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">{isEditing ? 'Opslaan' : 'Aanmaken'}</button>
                <button type="button" onClick={onCancel} className="rounded-md bg-slate-700/50 border border-slate-600 px-4 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50">Annuleren</button>
            </div>
        </form>
    );
}

function MemberAssignment({ group, allMembers, isAdmin, onClose }) {
    const form = useForm({
        member_ids: group.member_ids || [],
    });

    const baseUrl = isAdmin ? '/admin' : '/trainer';

    const handleSave = () => {
        form.put(`${baseUrl}/training-groups/${group.id}/members`, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    const removeMember = (id) => {
        form.setData('member_ids', form.data.member_ids.filter((mid) => mid !== id));
    };

    const addMember = (e) => {
        const val = parseInt(e.target.value);
        if (val && !form.data.member_ids.includes(val)) {
            form.setData('member_ids', [...form.data.member_ids, val]);
        }
        e.target.value = '';
    };

    const availableMembers = allMembers.filter((m) => !form.data.member_ids.includes(m.id));

    return (
        <div className="px-3 sm:px-6 py-4 bg-slate-800/50 border-t border-slate-700">
            <p className="text-sm font-medium text-slate-300 mb-3">Leden in {group.name}</p>

            <div className="flex flex-wrap gap-2 mb-4">
                {form.data.member_ids.map((mid) => {
                    const m = allMembers.find((am) => am.id === mid);
                    return m ? (
                        <span key={mid} className="inline-flex items-center gap-1 rounded-full bg-rose-900/30 px-2.5 py-1 text-sm font-medium text-rose-300">
                            {m.name}
                            <button type="button" onClick={() => removeMember(mid)} className="text-rose-400 hover:text-rose-200 ml-0.5">&times;</button>
                        </span>
                    ) : null;
                })}
                {form.data.member_ids.length === 0 && (
                    <span className="text-sm text-slate-500">Geen leden in deze groep</span>
                )}
            </div>

            <div className="flex items-center gap-3">
                <select onChange={addMember} className="flex-1 rounded-lg border border-slate-600 bg-slate-700/50 text-white text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                    <option value="">Lid toevoegen...</option>
                    {availableMembers.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
                <button type="button" disabled={form.processing} onClick={handleSave} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">Opslaan</button>
                <button type="button" onClick={() => { form.setData('member_ids', group.member_ids || []); onClose(); }} className="rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700">Annuleren</button>
            </div>
        </div>
    );
}
