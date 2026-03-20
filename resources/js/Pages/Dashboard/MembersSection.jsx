import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import MemberCard from './MemberCard';

export default function MembersSection({ members, ageCategories, weightCategories, beltRanks }) {
    const { flash } = usePage().props;
    const [showAddForm, setShowAddForm] = useState(false);
    const [search, setSearch] = useState('');
    const [viewingMember, setViewingMember] = useState(null);
    const [editingMember, setEditingMember] = useState(null);

    const filtered = members.filter((m) => {
        const q = search.toLowerCase();
        return (
            m.first_name.toLowerCase().includes(q) ||
            m.last_name.toLowerCase().includes(q) ||
            (m.license_number && m.license_number.toLowerCase().includes(q)) ||
            (m.email && m.email.toLowerCase().includes(q))
        );
    });

    const getAgeCategoryName = (member) => {
        if (!member.date_of_birth) return '-';
        const birthDate = new Date(member.date_of_birth);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        const ageCat = ageCategories.find(
            (c) => c.country_code === 'BE' && age >= c.min_age && age <= c.max_age
        );
        return ageCat ? ageCat.name : '-';
    };

    const getWeightCategoryName = (member) => {
        return member.weight_category_name || '-';
    };

    if (viewingMember) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Lidkaart</h2>
                    <button
                        onClick={() => setViewingMember(null)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Terug naar lijst
                    </button>
                </div>
                <div className="p-6">
                    <MemberCard
                        member={viewingMember}
                        ageCategories={ageCategories}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Leden
                    <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {members.length}
                    </span>
                </h2>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Zoeken..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded-md border border-gray-300 text-sm py-1 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        onClick={() => { setShowAddForm(!showAddForm); setEditingMember(null); }}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        {showAddForm ? 'Annuleren' : 'Lid toevoegen'}
                    </button>
                </div>
            </div>

            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-green-50 border border-green-200 p-3">
                    <p className="text-sm text-green-800">{flash.status}</p>
                </div>
            )}

            {showAddForm && (
                <MemberForm
                    onSuccess={() => setShowAddForm(false)}
                    onCancel={() => setShowAddForm(false)}
                    ageCategories={ageCategories}
                    weightCategories={weightCategories}
                    beltRanks={beltRanks}
                />
            )}

            {editingMember && (
                <MemberForm
                    member={editingMember}
                    onSuccess={() => setEditingMember(null)}
                    onCancel={() => setEditingMember(null)}
                    ageCategories={ageCategories}
                    weightCategories={weightCategories}
                    beltRanks={beltRanks}
                />
            )}

            {filtered.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                    {search ? 'Geen leden gevonden.' : 'Nog geen leden.'}
                </div>
            ) : (
                <div className="divide-y divide-gray-200">
                    {filtered.map((member) => (
                        <MemberRow
                            key={member.id}
                            member={member}
                            ageCategoryName={getAgeCategoryName(member)}
                            weightCategoryName={getWeightCategoryName(member)}
                            onView={() => setViewingMember(member)}
                            onEdit={() => { setEditingMember(member); setShowAddForm(false); }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function MemberRow({ member, ageCategoryName, weightCategoryName, onView, onEdit }) {
    const deleteForm = useForm({});
    const statusLabels = { active: 'Actief', inactive: 'Inactief', suspended: 'Geschorst', pending: 'In afwachting' };
    const statusColors = { active: 'bg-green-100 text-green-700', inactive: 'bg-gray-100 text-gray-600', suspended: 'bg-red-100 text-red-700', pending: 'bg-yellow-100 text-yellow-700' };

    const handleDelete = () => {
        if (confirm(`Weet je zeker dat je "${member.first_name} ${member.last_name}" wilt verwijderen?`)) {
            deleteForm.delete(`/admin/members/${member.id}`);
        }
    };

    return (
        <div className={`px-6 py-4 flex items-center justify-between gap-4 ${member.membership_status !== 'active' ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {member.photo_url ? (
                    <img src={member.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                        {member.first_name[0]}{member.last_name[0]}
                    </div>
                )}
                <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                        {member.first_name} {member.last_name}
                        {member.license_number && (
                            <span className="ml-2 text-xs text-gray-400">#{member.license_number}</span>
                        )}
                    </p>
                    <p className="text-xs text-gray-500">
                        {ageCategoryName} · {weightCategoryName} · {member.current_belt_label || '-'} · {member.gender === 'male' ? 'M' : 'V'}
                        {member.is_competition && (
                            <span className="ml-1 text-blue-600">· Competitie</span>
                        )}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[member.membership_status] || ''}`}>
                    {statusLabels[member.membership_status] || member.membership_status}
                </span>
                <button onClick={onView} className="text-sm text-gray-600 hover:text-gray-800">
                    Kaart
                </button>
                <button onClick={onEdit} className="text-sm text-blue-600 hover:text-blue-800">
                    Bewerken
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleteForm.processing}
                    className="text-sm text-red-600 hover:text-red-800"
                >
                    Verwijderen
                </button>
            </div>
        </div>
    );
}

function MemberForm({ member, onSuccess, onCancel, ageCategories, weightCategories, beltRanks }) {
    const isEditing = !!member;
    const form = useForm({
        first_name: member?.first_name || '',
        last_name: member?.last_name || '',
        date_of_birth: member?.date_of_birth ? member.date_of_birth.split('T')[0] : '',
        gender: member?.gender || 'male',
        email: member?.email || '',
        phone: member?.phone || '',
        address_street: member?.address_street || '',
        address_city: member?.address_city || '',
        address_postal_code: member?.address_postal_code || '',
        license_number: member?.license_number || '',
        weight_category_id: member?.weight_category_id || '',
        belt_rank: member?.current_belt || '',
        membership_status: member?.membership_status || 'active',
        is_competition: member?.is_competition || false,
        photo: null,
    });

    // Compute available weight categories based on date_of_birth + gender
    const getAvailableWeightCategories = () => {
        if (!form.data.date_of_birth || !form.data.gender) return [];
        const birthDate = new Date(form.data.date_of_birth);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        const ageCat = ageCategories.find(
            (c) => c.country_code === 'BE' && age >= c.min_age && age <= c.max_age
        );
        if (!ageCat) return [];
        return weightCategories
            .filter((w) => w.age_category_id === ageCat.id && w.gender === form.data.gender)
            .sort((a, b) => a.display_order - b.display_order);
    };

    const availableWeightCategories = getAvailableWeightCategories();

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = { ...form.data };
        // Clean empty strings to null
        ['email', 'phone', 'address_street', 'address_city', 'address_postal_code', 'license_number'].forEach((f) => {
            if (formData[f] === '') formData[f] = null;
        });
        if (formData.weight_category_id === '') formData.weight_category_id = null;
        if (formData.belt_rank === '') formData.belt_rank = null;

        if (isEditing) {
            // Use POST with _method for file uploads
            form.transform(() => ({ ...formData, _method: 'PATCH' }));
            form.post(`/admin/members/${member.id}`, {
                onSuccess,
                forceFormData: true,
            });
        } else {
            form.transform(() => formData);
            form.post('/admin/members', {
                onSuccess: () => { form.reset(); onSuccess(); },
                forceFormData: true,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {isEditing ? `Bewerk: ${member.first_name} ${member.last_name}` : 'Nieuw lid'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Voornaam *</label>
                    <input type="text" value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    {form.errors.first_name && <p className="text-xs text-red-600 mt-1">{form.errors.first_name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Naam *</label>
                    <input type="text" value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    {form.errors.last_name && <p className="text-xs text-red-600 mt-1">{form.errors.last_name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Geboortedatum *</label>
                    <input type="date" value={form.data.date_of_birth} onChange={(e) => form.setData('date_of_birth', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    {form.errors.date_of_birth && <p className="text-xs text-red-600 mt-1">{form.errors.date_of_birth}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Geslacht *</label>
                    <select value={form.data.gender} onChange={(e) => form.setData('gender', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="male">Man</option>
                        <option value="female">Vrouw</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">E-mail</label>
                    <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    {form.errors.email && <p className="text-xs text-red-600 mt-1">{form.errors.email}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Telefoon</label>
                    <input type="text" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    {form.errors.phone && <p className="text-xs text-red-600 mt-1">{form.errors.phone}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Licentienummer</label>
                    <input type="text" value={form.data.license_number} onChange={(e) => form.setData('license_number', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    {form.errors.license_number && <p className="text-xs text-red-600 mt-1">{form.errors.license_number}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Gewichtsklasse</label>
                    <select value={form.data.weight_category_id} onChange={(e) => form.setData('weight_category_id', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Geen</option>
                        {availableWeightCategories.map((wc) => (
                            <option key={wc.id} value={wc.id}>{wc.name}</option>
                        ))}
                    </select>
                    {availableWeightCategories.length === 0 && form.data.date_of_birth && (
                        <p className="text-xs text-gray-400 mt-1">Geen klasses voor deze leeftijd/geslacht</p>
                    )}
                    {form.errors.weight_category_id && <p className="text-xs text-red-600 mt-1">{form.errors.weight_category_id}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Gordel</label>
                    <select value={form.data.belt_rank} onChange={(e) => form.setData('belt_rank', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Geen</option>
                        {(beltRanks || []).map((br) => (
                            <option key={br.value} value={br.value}>{br.label}</option>
                        ))}
                    </select>
                    {form.errors.belt_rank && <p className="text-xs text-red-600 mt-1">{form.errors.belt_rank}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Straat + nr</label>
                    <input type="text" value={form.data.address_street} onChange={(e) => form.setData('address_street', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Postcode</label>
                    <input type="text" value={form.data.address_postal_code} onChange={(e) => form.setData('address_postal_code', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Stad</label>
                    <input type="text" value={form.data.address_city} onChange={(e) => form.setData('address_city', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Status *</label>
                    <select value={form.data.membership_status} onChange={(e) => form.setData('membership_status', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="active">Actief</option>
                        <option value="inactive">Inactief</option>
                        <option value="suspended">Geschorst</option>
                        <option value="pending">In afwachting</option>
                    </select>
                </div>
                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={form.data.is_competition} onChange={(e) => form.setData('is_competition', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Competitie
                    </label>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Foto</label>
                    <input type="file" accept="image/*" onChange={(e) => form.setData('photo', e.target.files[0])}
                        className="w-full text-sm text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200" />
                    {form.errors.photo && <p className="text-xs text-red-600 mt-1">{form.errors.photo}</p>}
                </div>
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={form.processing}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {isEditing ? 'Opslaan' : 'Lid aanmaken'}
                </button>
                <button type="button" onClick={onCancel}
                    className="rounded-md bg-white border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Annuleren
                </button>
            </div>
        </form>
    );
}
