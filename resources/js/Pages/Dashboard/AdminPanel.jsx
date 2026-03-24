import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AgeCategoriesSection from './AgeCategoriesSection';
import WeightCategoriesSection from './WeightCategoriesSection';

export default function AdminPanel({ pendingUsers, users, roles, ageCategories, weightCategories, allMembers, clubSettings }) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Beheerder Dashboard</h1>

            <ClubSettingsSection clubSettings={clubSettings} />

            <div className="mt-8">
                <PendingUsersSection pendingUsers={pendingUsers} roles={roles} />
            </div>

            <div className="mt-8">
                <UsersSection users={users} roles={roles} allMembers={allMembers} />
            </div>

            <div className="mt-8">
                <AgeCategoriesSection ageCategories={ageCategories} />
            </div>

            <div className="mt-8">
                <WeightCategoriesSection ageCategories={ageCategories} weightCategories={weightCategories} />
            </div>
        </div>
    );
}

function ClubSettingsSection({ clubSettings }) {
    const form = useForm({
        name: clubSettings.name || '',
        address_street: clubSettings.address_street || '',
        address_city: clubSettings.address_city || '',
        address_postal_code: clubSettings.address_postal_code || '',
        logo: null,
    });

    const [logoPreview, setLogoPreview] = useState(
        clubSettings.logo_data ? '/club-logo' : null
    );

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            form.setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.patch('/admin/club-settings', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Club Instellingen</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Clubnaam *</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                        {form.errors.name && <p className="text-sm text-red-600 mt-1">{form.errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                        <input
                            type="text"
                            value={form.data.address_postal_code}
                            onChange={(e) => form.setData('address_postal_code', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Straat + nummer</label>
                        <input
                            type="text"
                            value={form.data.address_street}
                            onChange={(e) => form.setData('address_street', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gemeente</label>
                        <input
                            type="text"
                            value={form.data.address_city}
                            onChange={(e) => form.setData('address_city', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                    <div className="flex items-center gap-4">
                        {logoPreview && (
                            <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain rounded border border-gray-200" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    {form.errors.logo && <p className="text-sm text-red-600 mt-1">{form.errors.logo}</p>}
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        Opslaan
                    </button>
                </div>
            </form>
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

function UsersSection({ users, roles, allMembers }) {
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
                        <UserRow key={user.id} user={user} roles={roles} allMembers={allMembers} />
                    ))}
                </div>
            )}
        </div>
    );
}

function UserRow({ user, roles, allMembers }) {
    const [editing, setEditing] = useState(false);
    const [managingMembers, setManagingMembers] = useState(false);
    const form = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        results_interest: user.results_interest || false,
    });
    const toggleForm = useForm({});
    const membersForm = useForm({
        member_ids: user.member_ids || [],
    });

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
                <div className="flex items-center gap-4 mb-3">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.data.results_interest}
                            onChange={(e) => form.setData('results_interest', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Interesse in toernooiresultaten
                    </label>
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
        <>
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
                    <div className="flex items-center gap-2 mt-0.5">
                        {(user.member_ids || []).length > 0 && (
                            <span className="text-xs text-gray-400">
                                {(user.member_ids || []).length} lid(leden) gekoppeld
                            </span>
                        )}
                        {user.results_interest && (
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                Resultaten
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                        {roles.find((r) => r.value === user.role)?.label}
                    </span>
                    <button
                        onClick={() => { setManagingMembers(!managingMembers); setEditing(false); }}
                        className="text-sm text-green-600 hover:text-green-800"
                    >
                        Leden
                    </button>
                    <button
                        onClick={() => { setEditing(true); setManagingMembers(false); }}
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

            {managingMembers && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Gekoppelde leden</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {membersForm.data.member_ids.map((mid) => {
                            const m = allMembers.find((am) => am.id === mid);
                            return m ? (
                                <span key={mid} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                    {m.name}
                                    <button type="button" onClick={() => membersForm.setData('member_ids', membersForm.data.member_ids.filter((id) => id !== mid))}
                                        className="text-blue-600 hover:text-blue-900 ml-0.5">&times;</button>
                                </span>
                            ) : null;
                        })}
                        {membersForm.data.member_ids.length === 0 && (
                            <span className="text-xs text-gray-400">Geen leden gekoppeld</span>
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
                            className="rounded-md border border-gray-300 text-sm py-1 px-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Opslaan
                        </button>
                        <button
                            type="button"
                            onClick={() => { membersForm.setData('member_ids', user.member_ids || []); setManagingMembers(false); }}
                            className="rounded-md bg-white border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Annuleren
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

<div className="flex gap-3 mb-4">
    <form
        method="POST"
        encType="multipart/form-data"
        onSubmit={e => {
            e.preventDefault();
            if (e.target.file.files.length) {
                const form = new FormData();
                form.append('file', e.target.file.files[0]);
                window.axios.post('/admin/members/import', form, { headers: { 'Content-Type': 'multipart/form-data' } })
                    .then(() => window.location.reload());
            }
        }}
    >
        <input type="file" name="file" accept=".xlsx" className="inline-block mr-2" required />
        <button type="submit" className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">Importeren</button>
    </form>
    <a
        href="/admin/members/export"
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
    >
        Exporteren
    </a>
</div>
