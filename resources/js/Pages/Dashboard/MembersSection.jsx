import { useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import MemberCard from './MemberCard';
import PhotoCapture from '../../Components/PhotoCapture';

export default function MembersSection({ members, ageCategories, weightCategories, beltRanks }) {
    const { flash } = usePage().props;
    const [showAddForm, setShowAddForm] = useState(false);
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilter = urlParams.get('filter') === 'renewal' ? 'renewal' : 'all';
    const [activeFilter, setActiveFilter] = useState(initialFilter);
    const [search, setSearch] = useState('');
    const [viewingMember, setViewingMember] = useState(null);
    const [editingMember, setEditingMember] = useState(null);
    const importFileRef = useRef(null);
    const [importing, setImporting] = useState(false);
    const [sendingReminders, setSendingReminders] = useState(false);

    const filtered = members.filter((m) => {
        if (activeFilter === 'renewal') {
            if (!m.membership_renewal_date) return false;
            const renewalDate = new Date(m.membership_renewal_date);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() + 30);
            if (renewalDate > cutoff) return false;
        }
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

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImporting(true);
        router.post('/admin/members/import', { file }, {
            forceFormData: true,
            onFinish: () => {
                setImporting(false);
                if (importFileRef.current) importFileRef.current.value = '';
            },
        });
    };

    if (viewingMember) {
        return (
            <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Lidkaart</h2>
                    <button
                        onClick={() => setViewingMember(null)}
                        className="text-sm text-slate-500 hover:text-slate-300"
                    >
                        ← Terug naar lijst
                    </button>
                </div>
                <div className="p-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <MemberCard
                            member={viewingMember}
                            ageCategories={ageCategories}
                            showPaidButton={true}
                        />
                        {viewingMember.is_competition && viewingMember.tournament_results && viewingMember.tournament_results.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Uitslagen</h3>
                                <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                                    {viewingMember.tournament_results.map((r) => (
                                        <div key={r.id} className="rounded-md border border-slate-800 bg-slate-700/50 p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-slate-300 truncate">{r.tournament_name}</p>
                                                    <p className="text-xs text-slate-400">{new Date(r.tournament_date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                </div>
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0 ${r.result.includes('1e') ? 'bg-yellow-900/40 text-yellow-400' :
                                                    r.result.includes('2e') ? 'bg-slate-200 text-slate-300' :
                                                        r.result.includes('3e') ? 'bg-rose-900/30 text-rose-300' :
                                                            'bg-slate-800 text-slate-400'
                                                    }`}>
                                                    {r.result}
                                                </span>
                                            </div>
                                            {r.notes && (
                                                <p className="text-xs text-slate-500 mt-1.5 break-words italic">{r.notes}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                    Leden
                    <span className="ml-2 inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                        {members.length}
                    </span>
                </h2>
                <div className="flex items-center gap-3">
                    {activeFilter === 'renewal' && (
                        <button
                            onClick={() => setActiveFilter('all')}
                            className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/40 ring-1 ring-amber-700/40 px-3 py-1 text-xs font-medium text-amber-400 hover:bg-amber-900/60 transition-colors"
                        >
                            💳 Vernieuwing nodig
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                    <input
                        type="text"
                        placeholder="Zoeken..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                    <a
                        href="/admin/members/export"
                        className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50"
                    >
                        Export
                    </a>
                    <input
                        type="file"
                        ref={importFileRef}
                        accept=".xlsx,.xls,.csv"
                        onChange={handleImportFile}
                        className="hidden"
                    />
                    <button
                        onClick={() => importFileRef.current?.click()}
                        disabled={importing}
                        className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50 disabled:opacity-50"
                    >
                        {importing ? 'Importeren...' : 'Import'}
                    </button>
                    <button
                        onClick={() => { setShowAddForm(!showAddForm); setEditingMember(null); }}
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
                    >
                        {showAddForm ? 'Annuleren' : 'Lid toevoegen'}
                    </button>
                    <button
                        onClick={() => {
                            setSendingReminders(true);
                            router.post('/admin/members/send-renewal-reminders', {}, {
                                onFinish: () => setSendingReminders(false),
                            });
                        }}
                        disabled={sendingReminders}
                        className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50 disabled:opacity-50"
                    >
                        {sendingReminders ? 'Versturen...' : 'Herinneringen versturen'}
                    </button>
                </div>
            </div>

            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 border ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
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
                <div className="px-6 py-8 text-center text-slate-500">
                    {search ? 'Geen leden gevonden.' : 'Nog geen leden.'}
                </div>
            ) : (
                <div className="divide-y divide-slate-700">
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
    const paidForm = useForm({});
    const statusLabels = { active: 'Actief', inactive: 'Inactief', suspended: 'Geschorst', pending: 'In afwachting' };
    const statusColors = { active: 'bg-emerald-900/40 text-emerald-400', inactive: 'bg-slate-800 text-slate-400', suspended: 'bg-red-900/40 text-red-400', pending: 'bg-yellow-900/40 text-yellow-700' };

    const handleDelete = () => {
        if (confirm(`Weet je zeker dat je "${member.first_name} ${member.last_name}" wilt verwijderen?`)) {
            deleteForm.delete(`/admin/members/${member.id}`);
        }
    };

    const handleMarkPaid = () => {
        if (confirm(`Lidgeld voor "${member.first_name} ${member.last_name}" markeren als betaald?`)) {
            paidForm.post(`/admin/members/${member.id}/mark-paid`);
        }
    };

    const renewalDate = member.membership_renewal_date ? new Date(member.membership_renewal_date) : null;
    const now = new Date();
    const daysUntilRenewal = renewalDate ? Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24)) : null;
    const renewalSoon = daysUntilRenewal !== null && daysUntilRenewal <= 30;
    const renewalOverdue = daysUntilRenewal !== null && daysUntilRenewal < 0;

    return (
        <div className={`px-6 py-4 flex items-center justify-between gap-4 ${member.membership_status !== 'active' ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {member.photo_url ? (
                    <img src={member.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-medium">
                        {member.first_name[0]}{member.last_name[0]}
                    </div>
                )}
                <div className="min-w-0">
                    <p className="font-medium text-white truncate">
                        {member.first_name} {member.last_name}
                        {member.license_number && (
                            <span className="ml-2 text-xs text-slate-400">#{member.license_number}</span>
                        )}
                    </p>
                    <p className="text-xs text-slate-500">
                        {ageCategoryName} · {weightCategoryName} · {member.current_belt_label || '-'} · {member.gender === 'male' ? 'M' : 'V'}
                        {member.is_competition && (
                            <span className="ml-1 text-rose-400">· Competitie</span>
                        )}
                    </p>
                    {renewalDate && (
                        <p className={`text-xs mt-0.5 ${renewalOverdue ? 'text-red-400 font-semibold' : renewalSoon ? 'text-amber-400' : 'text-slate-500'}`}>
                            Vernieuwing: {renewalDate.toLocaleDateString('nl-BE')}
                            {renewalOverdue && ' (verlopen)'}
                            {renewalSoon && !renewalOverdue && ` (${daysUntilRenewal} dagen)`}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[member.membership_status] || ''}`}>
                    {statusLabels[member.membership_status] || member.membership_status}
                </span>
                <button
                    onClick={handleMarkPaid}
                    disabled={paidForm.processing}
                    className="text-sm text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                    title="Lidgeld betaald — vernieuwingsdatum +1 jaar"
                >
                    Betaald
                </button>
                <button onClick={onView} className="text-sm text-slate-400 hover:text-slate-200">
                    Kaart
                </button>
                <button onClick={onEdit} className="text-sm text-rose-400 hover:text-rose-300">
                    Bewerken
                </button>
                <button
                    onClick={handleDelete}
                    disabled={deleteForm.processing}
                    className="text-sm text-red-400 hover:text-red-800"
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
        is_trainer: member?.is_trainer || false,
        membership_renewal_date: member?.membership_renewal_date ? member.membership_renewal_date.split('T')[0] : '',
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
            form.transform(() => formData);
            form.patch(`/admin/members/${member.id}`, { onSuccess });
        } else {
            form.transform(() => formData);
            form.post('/admin/members', {
                onSuccess: () => { form.reset(); onSuccess(); },
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="px-6 py-4 bg-slate-700/50 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
                {isEditing ? `Bewerk: ${member.first_name} ${member.last_name}` : 'Nieuw lid'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Voornaam *</label>
                    <input type="text" value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                    {form.errors.first_name && <p className="text-xs text-red-400 mt-1">{form.errors.first_name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Naam *</label>
                    <input type="text" value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                    {form.errors.last_name && <p className="text-xs text-red-400 mt-1">{form.errors.last_name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Geboortedatum *</label>
                    <input type="date" value={form.data.date_of_birth} onChange={(e) => form.setData('date_of_birth', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                    {form.errors.date_of_birth && <p className="text-xs text-red-400 mt-1">{form.errors.date_of_birth}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Geslacht *</label>
                    <select value={form.data.gender} onChange={(e) => form.setData('gender', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                        <option value="male">Man</option>
                        <option value="female">Vrouw</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">E-mail</label>
                    <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                    {form.errors.email && <p className="text-xs text-red-400 mt-1">{form.errors.email}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Telefoon</label>
                    <input type="text" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                    {form.errors.phone && <p className="text-xs text-red-400 mt-1">{form.errors.phone}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Licentienummer</label>
                    <input type="text" value={form.data.license_number} onChange={(e) => form.setData('license_number', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                    {form.errors.license_number && <p className="text-xs text-red-400 mt-1">{form.errors.license_number}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Gewichtsklasse</label>
                    <select value={form.data.weight_category_id} onChange={(e) => form.setData('weight_category_id', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                        <option value="">Geen</option>
                        {availableWeightCategories.map((wc) => (
                            <option key={wc.id} value={wc.id}>{wc.name}</option>
                        ))}
                    </select>
                    {availableWeightCategories.length === 0 && form.data.date_of_birth && (
                        <p className="text-xs text-slate-400 mt-1">Geen klasses voor deze leeftijd/geslacht</p>
                    )}
                    {form.errors.weight_category_id && <p className="text-xs text-red-400 mt-1">{form.errors.weight_category_id}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Gordel</label>
                    <select value={form.data.belt_rank} onChange={(e) => form.setData('belt_rank', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                        <option value="">Geen</option>
                        {(beltRanks || []).map((br) => (
                            <option key={br.value} value={br.value}>{br.label}</option>
                        ))}
                    </select>
                    {form.errors.belt_rank && <p className="text-xs text-red-400 mt-1">{form.errors.belt_rank}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Straat + nr</label>
                    <input type="text" value={form.data.address_street} onChange={(e) => form.setData('address_street', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Postcode</label>
                    <input type="text" value={form.data.address_postal_code} onChange={(e) => form.setData('address_postal_code', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Stad</label>
                    <input type="text" value={form.data.address_city} onChange={(e) => form.setData('address_city', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Status *</label>
                    <select value={form.data.membership_status} onChange={(e) => form.setData('membership_status', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                        <option value="active">Actief</option>
                        <option value="inactive">Inactief</option>
                        <option value="suspended">Geschorst</option>
                        <option value="pending">In afwachting</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Vernieuwingsdatum *</label>
                    <input type="date" value={form.data.membership_renewal_date} onChange={(e) => form.setData('membership_renewal_date', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                    {form.errors.membership_renewal_date && <p className="text-xs text-red-400 mt-1">{form.errors.membership_renewal_date}</p>}
                </div>
                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input type="checkbox" checked={form.data.is_competition} onChange={(e) => form.setData('is_competition', e.target.checked)}
                            className="rounded border-slate-600 bg-slate-700 text-rose-400 focus:ring-rose-500" />
                        Competitie
                    </label>
                </div>
                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input type="checkbox" checked={form.data.is_trainer} onChange={(e) => form.setData('is_trainer', e.target.checked)}
                            className="rounded border-slate-600 bg-slate-700 text-rose-400 focus:ring-rose-500" />
                        Trainer
                    </label>
                </div>
                <div>
                    <PhotoCapture onCapture={(dataUrl) => form.setData('photo', dataUrl)} currentPhotoUrl={member?.photo_url} error={form.errors.photo} />
                </div>
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={form.processing}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">
                    {isEditing ? 'Opslaan' : 'Lid aanmaken'}
                </button>
                <button type="button" onClick={onCancel}
                    className="rounded-md bg-slate-700/50 border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50">
                    Annuleren
                </button>
            </div>
        </form>
    );
}
