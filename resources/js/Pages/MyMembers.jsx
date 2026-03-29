import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
                <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-700/60 border-t-2 border-t-rose-700">
                    <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Lidkaart</h2>
                        <button onClick={() => setViewingMember(null)} className="text-sm font-medium text-slate-400 hover:text-slate-200">
                            ← Terug naar lijst
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <MemberCard member={viewingMember} ageCategories={ageCategories} />
                            <div className="space-y-6">
                                {viewingMember.voucher && (
                                    <div>
                                        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Voucher</h3>
                                        <div className="rounded-lg ring-1 ring-emerald-700/30 bg-emerald-900/20 p-4 flex items-center gap-4">
                                            <div className="bg-white rounded-lg p-2 flex-shrink-0">
                                                <QRCodeSVG value={viewingMember.voucher.code} size={80} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-white font-mono">{viewingMember.voucher.code}</p>
                                                <p className="text-sm text-emerald-400">{viewingMember.voucher.status_label}</p>
                                                <p className="text-xs text-slate-500 mt-1">Geldig tot {viewingMember.voucher.expires_at}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {viewingMember.is_competition && viewingMember.tournament_results && viewingMember.tournament_results.length > 0 && (
                                    <div>
                                        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Uitslagen</h3>
                                        <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                                            {viewingMember.tournament_results.map((r) => (
                                                <div key={r.id} className="rounded-lg ring-1 ring-slate-700 bg-slate-700/50 p-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-slate-200 truncate">{r.tournament_name}</p>
                                                            <p className="text-xs text-slate-500">{new Date(r.tournament_date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                        </div>
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 ${r.result.includes('1e') ? 'bg-yellow-900/40 text-yellow-400' :
                                                            r.result.includes('2e') ? 'bg-slate-600 text-slate-200' :
                                                                r.result.includes('3e') ? 'bg-rose-900/30 text-rose-400' :
                                                                    'bg-slate-700 text-slate-300'
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
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Mijn Leden" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-300">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white tracking-tight">Mijn Leden</h1>
            </div>

            <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-700/60 border-t-2 border-t-rose-700">
                {flash.status && (
                    <div className="mx-6 mt-4 rounded-lg bg-emerald-900/30 ring-1 ring-emerald-700/30 p-3">
                        <p className="text-sm text-emerald-400">{flash.status}</p>
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
                    <div className="px-6 py-12 text-center text-slate-500">
                        <svg className="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                        Geen leden aan je account gekoppeld.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {members.map((member) => (
                            <div key={member.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-700/30">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {member.photo_url ? (
                                        <img src={member.photo_url} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-600 to-orange-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                            {member.first_name[0]}{member.last_name[0]}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-medium text-white truncate">
                                            {member.first_name} {member.last_name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {member.current_belt_label || '-'} · {member.weight_category_name || '-'}
                                        </p>
                                        {member.voucher && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-700/30 mt-0.5">
                                                🎟️ {member.voucher.code}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setViewingMember(member)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700">
                                        Kaart
                                    </button>
                                    <button onClick={() => { setEditingMember(member); }} className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-400 hover:bg-rose-900/30">
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

        form.transform(() => formData);
        form.patch(`/mijn-leden/${member.id}`, { onSuccess });
    };

    return (
        <form onSubmit={handleSubmit} className="px-6 py-4 bg-slate-700/30 border-b border-slate-800/60">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
                Bewerk: {member.first_name} {member.last_name}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">E-mail</label>
                    <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-700/50 text-sm text-white py-1.5 px-3 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" />
                    {form.errors.email && <p className="text-xs text-red-400 mt-1">{form.errors.email}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Telefoon</label>
                    <input type="text" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-700/50 text-sm text-white py-1.5 px-3 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" />
                    {form.errors.phone && <p className="text-xs text-red-400 mt-1">{form.errors.phone}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Straat + nr</label>
                    <input type="text" value={form.data.address_street} onChange={(e) => form.setData('address_street', e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-700/50 text-sm text-white py-1.5 px-3 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Postcode</label>
                    <input type="text" value={form.data.address_postal_code} onChange={(e) => form.setData('address_postal_code', e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-700/50 text-sm text-white py-1.5 px-3 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Stad</label>
                    <input type="text" value={form.data.address_city} onChange={(e) => form.setData('address_city', e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-700/50 text-sm text-white py-1.5 px-3 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Gewichtsklasse</label>
                    <select value={form.data.weight_category_id} onChange={(e) => form.setData('weight_category_id', e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-700/50 text-sm text-white py-1.5 px-3 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20">
                        <option value="">Geen</option>
                        {availableWeightCategories.map((wc) => (
                            <option key={wc.id} value={wc.id}>{wc.name}</option>
                        ))}
                    </select>
                    {form.errors.weight_category_id && <p className="text-xs text-red-400 mt-1">{form.errors.weight_category_id}</p>}
                </div>
                <div>
                    <PhotoCapture onCapture={(dataUrl) => form.setData('photo', dataUrl)} currentPhotoUrl={member?.photo_url} error={form.errors.photo} />
                </div>
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={form.processing}
                    className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 shadow-sm">
                    Opslaan
                </button>
                <button type="button" onClick={onCancel}
                    className="rounded-lg bg-slate-700 ring-1 ring-slate-600 px-4 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-600">
                    Annuleren
                </button>
            </div>
        </form>
    );
}
