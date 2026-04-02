import { useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';

const TIERS = [
    { value: 'bronze', label: 'Brons', bg: 'bg-amber-900/40', text: 'text-amber-300' },
    { value: 'silver', label: 'Zilver', bg: 'bg-slate-600/50', text: 'text-slate-200' },
    { value: 'gold', label: 'Goud', bg: 'bg-yellow-900/40', text: 'text-yellow-400' },
];

function resizeImage(file, maxSize = 1920, quality = 0.85) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function tierBadge(tierValue) {
    const tier = TIERS.find((t) => t.value === tierValue);
    if (!tier) return null;
    return (
        <span className={`inline-flex items-center rounded-full ${tier.bg} px-2.5 py-0.5 text-xs font-semibold ${tier.text}`}>
            {tier.label}
        </span>
    );
}

function contractBadge(s) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(s.contract_end_date + 'T00:00:00');

    if (!s.is_active) return <span className="inline-flex items-center rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-300">Inactief</span>;
    if (now > end) return <span className="inline-flex items-center rounded-full bg-red-900/40 px-2.5 py-0.5 text-xs font-semibold text-red-400">Verlopen</span>;
    return <span className="inline-flex items-center rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">Actief</span>;
}

export default function SponsorsSection({ sponsors }) {
    const { flash } = usePage().props;
    const [editingId, setEditingId] = useState(null);

    return (
        <>
            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}
            {sponsors.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500">Geen sponsors gevonden.</div>
            ) : (
                <div className="divide-y divide-slate-800">
                    {sponsors.map((s) =>
                        editingId === s.id ? (
                            <EditRow key={s.id} sponsor={s} onCancel={() => setEditingId(null)} onSuccess={() => setEditingId(null)} />
                        ) : (
                            <SponsorRow key={s.id} sponsor={s} onEdit={() => setEditingId(s.id)} />
                        )
                    )}
                </div>
            )}
        </>
    );
}

function SponsorRow({ sponsor: s, onEdit }) {
    return (
        <div className="px-3 sm:px-6 py-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-white">{s.name}</h4>
                    {tierBadge(s.tier)}
                    {contractBadge(s)}
                    {s.has_logo && (
                        <span className="inline-flex items-center rounded-full bg-slate-700/60 px-2 py-0.5 text-xs text-slate-400">📷 Logo</span>
                    )}
                </div>
                {(s.address_street || s.address_city) && (
                    <p className="text-sm text-slate-400 mt-1">
                        {[s.address_street, s.address_postal_code, s.address_city].filter(Boolean).join(', ')}
                    </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                    Contract: {new Date(s.contract_start_date).toLocaleDateString('nl-BE')} — {new Date(s.contract_end_date).toLocaleDateString('nl-BE')}
                    {s.sponsor_amount != null && <> · €{Number(s.sponsor_amount).toFixed(2)}</>}
                    {s.renewal_months && <> · {s.renewal_months} mnd</>}
                </p>
                {(s.contact_name || s.contact_phone) && (
                    <p className="text-xs text-slate-500 mt-1">Contact: {[s.contact_name, s.contact_phone].filter(Boolean).join(' · ')}</p>
                )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <button
                    onClick={() => {
                        router.post(`/admin/sponsors/${s.id}/renew`, {}, { preserveScroll: true });
                    }}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                    +1 jaar
                </button>
                <button onClick={onEdit} className="text-xs font-medium text-rose-400 hover:text-rose-300">
                    Bewerken
                </button>
                <button
                    onClick={() => {
                        if (confirm(`Sponsor "${s.name}" verwijderen?`)) {
                            router.delete(`/admin/sponsors/${s.id}`, { preserveScroll: true });
                        }
                    }}
                    className="text-xs font-medium text-red-400 hover:text-red-300"
                >
                    Verwijderen
                </button>
            </div>
        </div>
    );
}

function EditRow({ sponsor: s, onCancel, onSuccess }) {
    const form = useForm({
        name: s.name,
        address_street: s.address_street || '',
        address_city: s.address_city || '',
        address_postal_code: s.address_postal_code || '',
        contact_name: s.contact_name || '',
        contact_phone: s.contact_phone || '',
        tier: s.tier,
        contract_start_date: s.contract_start_date,
        contract_end_date: s.contract_end_date,
        sponsor_amount: s.sponsor_amount ?? '',
        renewal_months: s.renewal_months ?? '',
        logo: '',
        remove_logo: false,
    });
    const fileRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const handleLogo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const dataUrl = await resizeImage(file);
        form.setData('logo', dataUrl);
        setLogoPreview(dataUrl);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.patch(`/admin/sponsors/${s.id}`, {
            preserveScroll: true,
            onSuccess,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="px-3 sm:px-6 py-4 bg-slate-800/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Naam *</label>
                    <input
                        type="text"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                    {form.errors.name && <p className="text-sm text-red-400 mt-1">{form.errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Formule *</label>
                    <select
                        value={form.data.tier}
                        onChange={(e) => form.setData('tier', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    >
                        {TIERS.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Straat + nummer</label>
                    <input
                        type="text"
                        value={form.data.address_street}
                        onChange={(e) => form.setData('address_street', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Postcode</label>
                    <input
                        type="text"
                        value={form.data.address_postal_code}
                        onChange={(e) => form.setData('address_postal_code', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Gemeente</label>
                    <input
                        type="text"
                        value={form.data.address_city}
                        onChange={(e) => form.setData('address_city', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Contactpersoon</label>
                    <input
                        type="text"
                        value={form.data.contact_name}
                        onChange={(e) => form.setData('contact_name', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        placeholder="Naam"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Tel. contactpersoon</label>
                    <input
                        type="text"
                        value={form.data.contact_phone}
                        onChange={(e) => form.setData('contact_phone', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        placeholder="Telefoonnummer"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Contract startdatum *</label>
                    <input
                        type="date"
                        value={form.data.contract_start_date}
                        onChange={(e) => form.setData('contract_start_date', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Contract einddatum *</label>
                    <input
                        type="date"
                        value={form.data.contract_end_date}
                        onChange={(e) => form.setData('contract_end_date', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Bedrag (€)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.data.sponsor_amount}
                        onChange={(e) => form.setData('sponsor_amount', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Vernieuwingstermijn</label>
                    <select
                        value={form.data.renewal_months}
                        onChange={(e) => form.setData('renewal_months', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    >
                        <option value="">Geen</option>
                        <option value="6">6 maanden</option>
                        <option value="12">12 maanden</option>
                        <option value="24">24 maanden</option>
                        <option value="36">36 maanden</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Logo</label>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogo}
                        className="text-sm text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-slate-600"
                    />
                </div>
                {logoPreview && (
                    <img src={logoPreview} alt="" className="w-16 h-16 rounded-lg object-contain ring-1 ring-slate-600" />
                )}
                {s.has_logo && !logoPreview && (
                    <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input
                            type="checkbox"
                            checked={form.data.remove_logo}
                            onChange={(e) => form.setData('remove_logo', e.target.checked)}
                            className="rounded border-slate-600 bg-slate-700 text-rose-500 focus:ring-rose-500"
                        />
                        Logo verwijderen
                    </label>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50"
                >
                    Opslaan
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
                >
                    Annuleren
                </button>
            </div>
        </form>
    );
}
