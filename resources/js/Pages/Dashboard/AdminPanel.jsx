import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import CollapsibleSection from '../../Components/CollapsibleSection';
import AgeCategoriesSection from './AgeCategoriesSection';
import InvoicesSection from './InvoicesSection';
import TrainingGroupsSection from './TrainingGroupsSection';
import WeightCategoriesSection from './WeightCategoriesSection';

export default function AdminPanel({ pendingUsers, users, roles, ageCategories, weightCategories, allMembers, clubSettings, renewalDueCount, renewalDueMembers, trainingGroups, trainers, invoices }) {
    const urlParams = new URLSearchParams(window.location.search);
    const [renewalListOpen, setRenewalListOpen] = useState(urlParams.get('renewal') === 'open');

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white">Beheerder Dashboard</h1>

            {renewalDueCount > 0 && (
                <div className="rounded-xl bg-amber-900/30 ring-1 ring-amber-700/30 overflow-hidden">
                    <button
                        onClick={() => setRenewalListOpen(!renewalListOpen)}
                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-amber-900/20 transition-colors"
                    >
                        <span className="text-2xl">💳</span>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-400">
                                {renewalDueCount} {renewalDueCount === 1 ? 'lid heeft' : 'leden hebben'} een vernieuwing nodig
                            </p>
                            <p className="text-xs text-amber-500/80 mt-0.5">Lidmaatschap verloopt binnen 30 dagen of is al verlopen</p>
                        </div>
                        <svg className={`w-5 h-5 text-amber-400 transition-transform ${renewalListOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {renewalListOpen && renewalDueMembers && (
                        <div className="border-t border-amber-700/30 divide-y divide-amber-700/20">
                            {renewalDueMembers.map((m) => {
                                const d = new Date(m.membership_renewal_date);
                                const days = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
                                const overdue = days < 0;
                                return (
                                    <div key={m.id} className="px-4 py-3 flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{m.name}</p>
                                            {m.email && <p className="text-xs text-slate-400 truncate">{m.email}</p>}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-xs font-medium ${overdue ? 'text-red-400' : 'text-amber-400'}`}>
                                                {d.toLocaleDateString('nl-BE')}
                                            </p>
                                            <p className={`text-xs ${overdue ? 'text-red-500' : 'text-amber-500/70'}`}>
                                                {overdue ? `${Math.abs(days)} dagen verlopen` : `nog ${days} dagen`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <CollapsibleSection title="Club Instellingen">
                <ClubSettingsSection clubSettings={clubSettings} />
            </CollapsibleSection>

            <CollapsibleSection title="Nieuwe aanvragen" count={pendingUsers.length} defaultOpen={pendingUsers.length > 0} badge="bg-rose-900/30 text-rose-300">
                <PendingUsersSection pendingUsers={pendingUsers} roles={roles} />
            </CollapsibleSection>

            <CollapsibleSection title="Gebruikers" count={users.length}>
                <UsersSection users={users} roles={roles} allMembers={allMembers} />
            </CollapsibleSection>

            <CollapsibleSection title="Leeftijdscategorieën" count={ageCategories.length}>
                <AgeCategoriesSection ageCategories={ageCategories} />
            </CollapsibleSection>

            <CollapsibleSection title="Gewichtscategorieën" count={weightCategories.length}>
                <WeightCategoriesSection ageCategories={ageCategories} weightCategories={weightCategories} />
            </CollapsibleSection>

            <CollapsibleSection title="Trainingsgroepen" count={trainingGroups.length}>
                <TrainingGroupsSection trainingGroups={trainingGroups} trainers={trainers} allMembers={allMembers} />
            </CollapsibleSection>

            <CollapsibleSection title="Trainingshistoriek">
                <div className="px-3 sm:px-6 py-4">
                    <div className="flex items-center gap-4 mb-2">
                        <Link href="/admin/attendance-report" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
                            Aanwezigheidsrapport
                        </Link>
                        <Link href="/admin/sessions" className="text-sm font-medium text-rose-400 hover:text-rose-300">
                            Alle sessies bekijken →
                        </Link>
                    </div>
                    <p className="text-sm text-slate-400">Bekijk de volledige historiek van alle afgesloten trainingen, inclusief deelnemers en opmerkingen.</p>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Facturen" count={invoices?.length || 0}>
                <InvoicesSection invoices={invoices} />
            </CollapsibleSection>
        </div>
    );
}

function ClubSettingsSection({ clubSettings }) {
    const form = useForm({
        name: clubSettings.name || '',
        address_street: clubSettings.address_street || '',
        address_city: clubSettings.address_city || '',
        address_postal_code: clubSettings.address_postal_code || '',
        attendance_pin: clubSettings.attendance_pin || '',
        attendance_threshold: clubSettings.attendance_threshold ?? 70,
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Clubnaam *</label>
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                    {form.errors.name && <p className="text-sm text-red-400 mt-1">{form.errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Postcode</label>
                    <input
                        type="text"
                        value={form.data.address_postal_code}
                        onChange={(e) => form.setData('address_postal_code', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Straat + nummer</label>
                    <input
                        type="text"
                        value={form.data.address_street}
                        onChange={(e) => form.setData('address_street', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Gemeente</label>
                    <input
                        type="text"
                        value={form.data.address_city}
                        onChange={(e) => form.setData('address_city', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Logo</label>
                <div className="flex items-center gap-4">
                    {logoPreview && (
                        <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain rounded border border-slate-700" />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-rose-900/30 file:text-rose-300 hover:file:bg-rose-900/30"
                    />
                </div>
                {form.errors.logo && <p className="text-sm text-red-400 mt-1">{form.errors.logo}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Aanwezigheid PIN-code</label>
                <input
                    type="text"
                    inputMode="numeric"
                    value={form.data.attendance_pin}
                    onChange={(e) => form.setData('attendance_pin', e.target.value)}
                    placeholder="4-8 cijfers"
                    className="w-full max-w-xs rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">PIN voor het kiosk aanwezigheidsscherm (/attendance)</p>
                {form.errors.attendance_pin && <p className="text-sm text-red-400 mt-1">{form.errors.attendance_pin}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Minimum aanwezigheid (%)</label>
                <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.data.attendance_threshold}
                    onChange={(e) => form.setData('attendance_threshold', parseInt(e.target.value) || 0)}
                    className="w-full max-w-xs rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Leden onder dit percentage worden rood gemarkeerd in het aanwezigheidsrapport</p>
                {form.errors.attendance_threshold && <p className="text-sm text-red-400 mt-1">{form.errors.attendance_threshold}</p>}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                    Opslaan
                </button>
            </div>
        </form>
    );
}

function PendingUsersSection({ pendingUsers, roles }) {
    const { flash } = usePage().props;

    return (
        <>
            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 border ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}

            {pendingUsers.length === 0 ? (
                <div className="px-3 sm:px-6 py-8 text-center text-slate-500">
                    Geen openstaande aanvragen.
                </div>
            ) : (
                <div className="divide-y divide-slate-700">
                    {pendingUsers.map((user) => (
                        <PendingUserRow key={user.id} user={user} roles={roles} />
                    ))}
                </div>
            )}
        </>
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
        <div className="px-3 sm:px-6 py-4 flex items-center justify-between gap-4">
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
    );
}

function UsersSection({ users, roles, allMembers }) {
    const { flash } = usePage().props;

    return (
        <>
            {users.length === 0 ? (
                <div className="px-3 sm:px-6 py-8 text-center text-slate-500">
                    Geen gebruikers gevonden.
                </div>
            ) : (
                <div className="divide-y divide-slate-700">
                    {users.map((user) => (
                        <UserRow key={user.id} user={user} roles={roles} allMembers={allMembers} />
                    ))}
                </div>
            )}
        </>
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
                    <div className="flex items-center gap-2 mt-0.5">
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
        className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
    >
        Exporteren
    </a>
</div>
