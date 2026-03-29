import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function TrainingGroups({ groups, allMembers }) {
    const [managingId, setManagingId] = useState(null);

    return (
        <AppLayout>
            <Head title="Trainingsgroepen" />
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">Trainingsgroepen</h1>
                    <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                        ← Dashboard
                    </Link>
                </div>

                {groups.length === 0 ? (
                    <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-8 text-center">
                        <p className="text-slate-400">Je hebt nog geen trainingsgroepen toegewezen.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groups.map((group) => (
                            <div key={group.id} className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                                <div className="px-6 py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-semibold text-white text-lg">{group.name}</p>
                                                <span className="inline-flex items-center rounded-full bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-400">
                                                    €{Number(group.membership_fee).toFixed(2)}
                                                </span>
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
                                                onClick={() => setManagingId(managingId === group.id ? null : group.id)}
                                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${managingId === group.id
                                                        ? 'bg-rose-600 text-white'
                                                        : 'bg-slate-800 text-rose-400 hover:bg-slate-700 ring-1 ring-slate-700'
                                                    }`}
                                            >
                                                Leden beheren
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {managingId === group.id && (
                                    <MemberAssignment
                                        group={group}
                                        allMembers={allMembers}
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

function MemberAssignment({ group, allMembers, onClose }) {
    const form = useForm({
        member_ids: group.member_ids || [],
    });

    const handleSave = () => {
        form.put(`/trainer/training-groups/${group.id}/members`, {
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
        <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700">
            <p className="text-sm font-medium text-slate-300 mb-3">Leden in {group.name}</p>

            <div className="flex flex-wrap gap-2 mb-4">
                {form.data.member_ids.map((mid) => {
                    const m = allMembers.find((am) => am.id === mid);
                    return m ? (
                        <span key={mid} className="inline-flex items-center gap-1 rounded-full bg-rose-900/30 px-2.5 py-1 text-sm font-medium text-rose-300">
                            {m.name}
                            <button
                                type="button"
                                onClick={() => removeMember(mid)}
                                className="text-rose-400 hover:text-rose-200 ml-0.5"
                            >
                                &times;
                            </button>
                        </span>
                    ) : null;
                })}
                {form.data.member_ids.length === 0 && (
                    <span className="text-sm text-slate-500">Geen leden in deze groep</span>
                )}
            </div>

            <div className="flex items-center gap-3">
                <select
                    onChange={addMember}
                    className="flex-1 rounded-lg border border-slate-600 bg-slate-700/50 text-white text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                    <option value="">Lid toevoegen...</option>
                    {availableMembers.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
                <button
                    type="button"
                    disabled={form.processing}
                    onClick={handleSave}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                    Opslaan
                </button>
                <button
                    type="button"
                    onClick={() => { form.setData('member_ids', group.member_ids || []); onClose(); }}
                    className="rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
                >
                    Annuleren
                </button>
            </div>
        </div>
    );
}
