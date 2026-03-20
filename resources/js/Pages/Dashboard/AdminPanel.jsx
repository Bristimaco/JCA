import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminPanel({ pendingUsers, roles }) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Beheerder Dashboard</h1>

            <PendingUsersSection pendingUsers={pendingUsers} roles={roles} />
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
