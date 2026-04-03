import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export function PendingUsersSection({ pendingUsers, roles, extraModules }) {
    const { flash } = usePage().props;

    return (
        <>
            {flash.status && (
                <div className="mb-4 rounded-md bg-emerald-900/30 border ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}

            {pendingUsers.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                    Geen openstaande aanvragen.
                </div>
            ) : (
                <div className="divide-y divide-slate-700 rounded-xl bg-slate-800/40 ring-1 ring-slate-700/50 overflow-hidden">
                    {pendingUsers.map((user) => (
                        <PendingUserRow key={user.id} user={user} roles={roles} extraModules={extraModules} />
                    ))}
                </div>
            )}
        </>
    );
}

function PendingUserRow({ user, roles, extraModules }) {
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedModules, setSelectedModules] = useState([]);
    const form = useForm({ role: '', extra_modules: [] });

    const toggleModule = (value) => {
        setSelectedModules((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const handleApprove = (e) => {
        e.preventDefault();
        form.transform(() => ({ role: selectedRole, extra_modules: selectedModules }));
        form.patch(`/admin/users/${user.id}/approve`);
    };

    return (
        <div className="px-3 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <p className="text-xs text-slate-400">
                        Geregistreerd op {new Date(user.created_at).toLocaleDateString('nl-BE')}
                    </p>
                </div>
                <form onSubmit={handleApprove} className="flex items-center gap-2">
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                        <option value="">Kies rol...</option>
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        disabled={!selectedRole || form.processing}
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Goedkeuren
                    </button>
                </form>
            </div>
            <div className="mt-2">
                <p className="text-xs font-medium text-slate-400 mb-1">Extra modules</p>
                <div className="flex flex-wrap gap-1.5">
                    {extraModules.map((mod) => (
                        <button
                            key={mod.value}
                            type="button"
                            onClick={() => toggleModule(mod.value)}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                                selectedModules.includes(mod.value)
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            {mod.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function UsersSection({ users, roles, extraModules, allMembers }) {
    return (
        <>
            {users.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                    Geen gebruikers gevonden.
                </div>
            ) : (
                <div className="divide-y divide-slate-700 rounded-xl bg-slate-800/40 ring-1 ring-slate-700/50 overflow-hidden">
                    {users.map((user) => (
                        <UserRow key={user.id} user={user} roles={roles} extraModules={extraModules} allMembers={allMembers} />
                    ))}
                </div>
            )}
        </>
    );
}

function UserRow({ user, roles, extraModules, allMembers }) {
    const { auth } = usePage().props;
    const [editing, setEditing] = useState(false);
    const [managingMembers, setManagingMembers] = useState(false);
    const form = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        results_interest: user.results_interest || false,
        extra_modules: user.extra_modules || [],
    });
    const toggleForm = useForm({});
    const membersForm = useForm({
        member_ids: user.member_ids || [],
    });

    const toggleModule = (value) => {
        const current = form.data.extra_modules;
        form.setData('extra_modules', current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value]
        );
    };

    const handleSave = (e) => {
        e.preventDefault();
        form.patch(`/admin/users/${user.id}`, {
            onSuccess: () => setEditing(false),
        });
    };

    const handleToggleActive = () => {
        toggleForm.patch(`/admin/users/${user.id}/toggle-active`);
    };

    if (editing) {
        return (
            <form onSubmit={handleSave} className="px-3 sm:px-6 py-4 bg-slate-700/50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
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
                        <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        />
                        {form.errors.email && <p className="text-xs text-red-400 mt-1">{form.errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Rol</label>
                        <select
                            value={form.data.role}
                            onChange={(e) => form.setData('role', e.target.value)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        >
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        {form.errors.role && <p className="text-xs text-red-400 mt-1">{form.errors.role}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.data.results_interest}
                            onChange={(e) => form.setData('results_interest', e.target.checked)}
                            className="rounded border-slate-600 bg-slate-700 text-rose-400 focus:ring-rose-500"
                        />
                        Interesse in toernooiresultaten
                    </label>
                </div>
                <div className="mb-3">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Extra modules</label>
                    <div className="flex flex-wrap gap-1.5">
                        {extraModules.map((mod) => (
                            <button
                                key={mod.value}
                                type="button"
                                onClick={() => toggleModule(mod.value)}
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                                    form.data.extra_modules.includes(mod.value)
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                {mod.label}
                            </button>
                        ))}
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
        <>
            <div className={`px-3 sm:px-6 py-4 flex items-center justify-between gap-4 ${!user.is_active ? 'opacity-50' : ''}`}>
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">
                        {user.name}
                        {!user.is_active && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-400">
                                Inactief
                            </span>
                        )}
                    </p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {(user.member_ids || []).length > 0 && (
                            <span className="text-xs text-slate-400">
                                {(user.member_ids || []).length} lid(leden) gekoppeld
                            </span>
                        )}
                        {user.results_interest && (
                            <span className="inline-flex items-center rounded-full bg-purple-900/40 px-2 py-0.5 text-xs font-medium text-purple-400">
                                Resultaten
                            </span>
                        )}
                        {(user.extra_modules || []).map((mod) => {
                            const label = extraModules.find((m) => m.value === mod)?.label || mod;
                            return (
                                <span key={mod} className="inline-flex items-center rounded-full bg-rose-900/30 px-2 py-0.5 text-xs font-medium text-rose-300">
                                    {label}
                                </span>
                            );
                        })}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                        {roles.find((r) => r.value === user.role)?.label}
                    </span>
                    <button
                        onClick={() => { setManagingMembers(!managingMembers); setEditing(false); }}
                        className="text-sm text-emerald-600 hover:text-emerald-400"
                    >
                        Leden
                    </button>
                    <button
                        onClick={() => { setEditing(true); setManagingMembers(false); }}
                        className="text-sm text-rose-400 hover:text-rose-300"
                    >
                        Bewerken
                    </button>
                    {auth.user?.role === 'admin' && user.id !== auth.user.id && (
                        <form method="post" action={`/admin/users/${user.id}/impersonate`} className="inline">
                            <input type="hidden" name="_token" value={document.querySelector('meta[name=csrf-token]')?.content} />
                            <button type="submit" className="text-sm text-amber-400 hover:text-amber-300">
                                Impersonate
                            </button>
                        </form>
                    )}
                    <button
                        onClick={handleToggleActive}
                        disabled={toggleForm.processing}
                        className={`text-sm ${user.is_active ? 'text-red-400 hover:text-red-800' : 'text-emerald-600 hover:text-emerald-400'}`}
                    >
                        {user.is_active ? 'Deactiveren' : 'Activeren'}
                    </button>
                </div>
            </div>

            {managingMembers && (
                <div className="px-3 sm:px-6 py-3 bg-slate-700/50 border-t border-slate-700">
                    <p className="text-xs font-medium text-slate-500 mb-2">Gekoppelde leden</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {membersForm.data.member_ids.map((mid) => {
                            const m = allMembers.find((am) => am.id === mid);
                            return m ? (
                                <span key={mid} className="inline-flex items-center gap-1 rounded-full bg-rose-900/30 px-2.5 py-0.5 text-xs font-medium text-rose-300">
                                    {m.name}
                                    <button type="button" onClick={() => membersForm.setData('member_ids', membersForm.data.member_ids.filter((id) => id !== mid))}
                                        className="text-rose-400 hover:text-blue-900 ml-0.5">&times;</button>
                                </span>
                            ) : null;
                        })}
                        {membersForm.data.member_ids.length === 0 && (
                            <span className="text-xs text-slate-400">Geen leden gekoppeld</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val && !membersForm.data.member_ids.includes(val)) {
                                    membersForm.setData('member_ids', [...membersForm.data.member_ids, val]);
                                }
                                e.target.value = '';
                            }}
                            className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        >
                            <option value="">Lid toevoegen...</option>
                            {allMembers.filter((am) => !membersForm.data.member_ids.includes(am.id)).map((am) => (
                                <option key={am.id} value={am.id}>{am.name}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            disabled={membersForm.processing}
                            onClick={() => membersForm.put(`/admin/users/${user.id}/members`, { onSuccess: () => setManagingMembers(false) })}
                            className="rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                            Opslaan
                        </button>
                        <button
                            type="button"
                            onClick={() => { membersForm.setData('member_ids', user.member_ids || []); setManagingMembers(false); }}
                            className="rounded-md bg-slate-700/50 border border-slate-600 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700/50"
                        >
                            Annuleren
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
