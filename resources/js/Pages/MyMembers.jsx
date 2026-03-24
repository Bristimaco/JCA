import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import MemberCard from './Dashboard/MemberCard';
import PhotoCapture from '../Components/PhotoCapture';

export default function MyMembers({ members, ageCategories, weightCategories }) {
    const { flash } = usePage().props;
    const [viewingMember, setViewingMember] = useState(null);
    const [editingMember, setEditingMember] = useState(null);

    if (viewingMember) {
        return (
            <AppLayout>
                <Head title="Mijn Leden" />
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Lidkaart</h2>
                        <button onClick={() => setViewingMember(null)} className="text-sm text-gray-500 hover:text-gray-700">
                            ← Terug naar lijst
                        </button>
                    </div>
                    <div className="p-6">
                        <MemberCard member={viewingMember} ageCategories={ageCategories} />
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Mijn Leden" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Mijn Leden</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {flash.status && (
                    <div className="mx-6 mt-4 rounded-md bg-green-50 border border-green-200 p-3">
                        <p className="text-sm text-green-800">{flash.status}</p>
                    </div>
                )}

                {editingMember && (
                    <MyMemberForm
                        member={editingMember}
                        ageCategories={ageCategories}
                        weightCategories={weightCategories}
                        onSuccess={() => setEditingMember(null)}
                        onCancel={() => setEditingMember(null)}
                    />
                )}

                {members.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                        Geen leden aan je account gekoppeld.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {members.map((member) => (
                            <div key={member.id} className="px-6 py-4 flex items-center justify-between gap-4">
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
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {member.current_belt_label || '-'} · {member.weight_category_name || '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setViewingMember(member)} className="text-sm text-gray-600 hover:text-gray-800">
                                        Kaart
                                    </button>
                                    <button onClick={() => { setEditingMember(member); }} className="text-sm text-blue-600 hover:text-blue-800">
                                        Bewerken
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function MyMemberForm({ member, ageCategories, weightCategories, onSuccess, onCancel }) {
    const form = useForm({
        email: member.email || '',
        phone: member.phone || '',
        address_street: member.address_street || '',
        address_city: member.address_city || '',
        address_postal_code: member.address_postal_code || '',
        weight_category_id: member.weight_category_id || '',
        photo: null,
    });

    const getAvailableWeightCategories = () => {
        if (!member.date_of_birth || !member.gender) return [];
        const birthDate = new Date(member.date_of_birth);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        const ageCat = ageCategories.find(
            (c) => c.country_code === 'BE' && age >= c.min_age && age <= c.max_age
        );
        if (!ageCat) return [];
        return weightCategories
            .filter((w) => w.age_category_id === ageCat.id && w.gender === member.gender)
            .sort((a, b) => a.display_order - b.display_order);
    };

    const availableWeightCategories = getAvailableWeightCategories();

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = { ...form.data };
        ['email', 'phone', 'address_street', 'address_city', 'address_postal_code'].forEach((f) => {
            if (formData[f] === '') formData[f] = null;
        });
        if (formData.weight_category_id === '') formData.weight_category_id = null;

        form.transform(() => ({ ...formData, _method: 'PATCH' }));
        form.post(`/mijn-leden/${member.id}`, {
            onSuccess,
            forceFormData: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Bewerk: {member.first_name} {member.last_name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
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
                    <label className="block text-xs font-medium text-gray-500 mb-1">Gewichtsklasse</label>
                    <select value={form.data.weight_category_id} onChange={(e) => form.setData('weight_category_id', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Geen</option>
                        {availableWeightCategories.map((wc) => (
                            <option key={wc.id} value={wc.id}>{wc.name}</option>
                        ))}
                    </select>
                    {form.errors.weight_category_id && <p className="text-xs text-red-600 mt-1">{form.errors.weight_category_id}</p>}
                </div>
                <div>
                    <PhotoCapture onCapture={(file) => form.setData('photo', file)} error={form.errors.photo} />
                </div>
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={form.processing}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    Opslaan
                </button>
                <button type="button" onClick={onCancel}
                    className="rounded-md bg-white border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Annuleren
                </button>
            </div>
        </form>
    );
}
