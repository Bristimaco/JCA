import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminPanel({ pendingUsers, users, roles }) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Beheerder Dashboard</h1>

            <PendingUsersSection pendingUsers={pendingUsers} roles={roles} />

            <div className="mt-8">
                <UsersSection users={users} roles={roles} />
            </div>
        </div>
    );
}

function PendingUsersSection({ pendingUsers, roles }) {
    const { flash } = usePage().props;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                    Nieuwe aanvragen
                    {pendingUsers.length > 0 && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {pendingUsers.length}
                        </span>
                    )}
                </h2>
            </div>

            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-green-50 border border-green-200 p-3">
                    <p className="text-sm text-green-800">{flash.status}</p>
                </div>
            )}

            {pendingUsers.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                    Geen openstaande aanvragen.
                </div>
            ) : (
                <div className="divide-y divide-gray-200">
                    {pendingUsers.map((user) => (
                        <PendingUserRow key={user.id} user={user} roles={roles} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PendingUserRow({ user, roles }) {
    const [selectedRole, setSelectedRole] = useState('');
    const form = useForm({ role: '' });

    const handleApprove = (e) => {
        e.preventDefault();
        form.transform(() => ({ role: selectedRole }));
        form.patch(`/admin/users/${user.id}/approve`);
    };

    return (
        <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">
                    Geregistreerd op {new Date(user.created_at).toLocaleDateString('nl-BE')}
                </p>
            </div>
            <form onSubmit={handleApprove} className="flex items-center gap-2">
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="rounded-md border border-gray-300 text-sm py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Goedkeuren
                </button>
            </form>
        </div>
    );
}

function UsersSection({ users, roles }) {
    const { flash } = usePage().props;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                    Gebruikers
                    <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {users.length}
                    </span>
                </h2>
            </div>

            {users.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                    Geen gebruikers gevonden.
                </div>
            ) : (
                <div className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <UserRow key={user.id} user={user} roles={roles} />
                    ))}
                </div>
            )}
        </div>
    );
}

function UserRow({ user, roles }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
    });
    const toggleForm = useForm({});

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
            <form onSubmit={handleSave} className="px-6 py-4 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Naam</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {form.errors.name && <p className="text-xs text-red-600 mt-1">{form.errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <input
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {form.errors.email && <p className="text-xs text-red-600 mt-1">{form.errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Rol</label>
                        <select
                            value={form.data.role}
                            onChange={(e) => form.setData('role', e.target.value)}
                            className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        {form.errors.role && <p className="text-xs text-red-600 mt-1">{form.errors.role}</p>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        Opslaan
                    </button>
                    <button
                        type="button"
                        onClick={() => { form.reset(); setEditing(false); }}
                        className="rounded-md bg-white border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Annuleren
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className={`px-6 py-4 flex items-center justify-between gap-4 ${!user.is_active ? 'opacity-50' : ''}`}>
            <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                    {user.name}
                    {!user.is_active && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Inactief
                        </span>
                    )}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                    {roles.find((r) => r.value === user.role)?.label}
                </span>
                <button
                    onClick={() => setEditing(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Bewerken
                </button>
                <button
                    onClick={handleToggleActive}
                    disabled={toggleForm.processing}
                    className={`text-sm ${user.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                >
                    {user.is_active ? 'Deactiveren' : 'Activeren'}
                </button>
            </div>
        </div>
    );
}
