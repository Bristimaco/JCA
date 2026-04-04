import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

function resizeImage(file, maxSize = 1920, quality = 0.85) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width *= ratio;
                    height *= ratio;
                }
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

const TIERS = [
    { value: 'bronze', label: 'Brons', bg: 'bg-amber-900/40', text: 'text-amber-300' },
    { value: 'silver', label: 'Zilver', bg: 'bg-slate-600/50', text: 'text-slate-200' },
    { value: 'gold', label: 'Goud', bg: 'bg-yellow-900/40', text: 'text-yellow-400' },
];

export default function SponsorDetail({ sponsor }) {
    return <SponsorDetailContent key={sponsor.id + '-' + (sponsor.cbe_fetched_at || 'none') + '-' + (sponsor.contract_end_date || '')} sponsor={sponsor} />;
}

function SponsorDetailContent({ sponsor }) {
    const { flash } = usePage().props;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);

    const companyForm = useForm({
        name: sponsor.name || '',
        address_street: sponsor.address_street || '',
        address_city: sponsor.address_city || '',
        address_postal_code: sponsor.address_postal_code || '',
        legal_form: sponsor.legal_form || '',
        phone: sponsor.phone || '',
        email: sponsor.email || '',
        website: sponsor.website || '',
        contact_name: sponsor.contact_name || '',
        contact_phone: sponsor.contact_phone || '',
        tier: sponsor.tier || 'bronze',
        contract_start_date: sponsor.contract_start_date || '',
        contract_end_date: sponsor.contract_end_date || '',
        sponsor_amount: sponsor.sponsor_amount ?? '',
        renewal_months: sponsor.renewal_months ?? '',
        logo: '',
        remove_logo: false,
    });

    const cbe = sponsor.cbe_data;

    const handleRefresh = () => {
        router.post(`/admin/sponsors/${sponsor.id}/refresh`, {}, { preserveScroll: true });
    };

    const handleDelete = () => {
        router.delete(`/admin/sponsors/${sponsor.id}`);
    };

    const handleRenew = () => {
        router.post(`/admin/sponsors/${sponsor.id}/renew`, {}, { preserveScroll: true });
    };

    const handleSave = (e) => {
        e.preventDefault();
        companyForm.patch(`/admin/sponsors/${sponsor.id}`, { preserveScroll: true });
    };

    const handleLogo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const dataUrl = await resizeImage(file);
        companyForm.setData('logo', dataUrl);
        setLogoPreview(dataUrl);
    };

    const formatVat = (vat) => {
        if (!vat) return '-';
        const str = String(vat);
        if (str.length === 10) return `BE ${str.slice(0,4)}.${str.slice(4,7)}.${str.slice(7)}`;
        if (str.length === 9) return `BE 0${str.slice(0,3)}.${str.slice(3,6)}.${str.slice(6)}`;
        return `BE ${str}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const tierObj = TIERS.find((t) => t.value === sponsor.tier);

    const contractBadge = () => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const end = new Date(sponsor.contract_end_date + 'T00:00:00');
        if (!sponsor.is_active) return <span className="inline-flex items-center rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-300">Inactief</span>;
        if (now > end) return <span className="inline-flex items-center rounded-full bg-red-900/40 px-2.5 py-0.5 text-xs font-semibold text-red-400">Verlopen</span>;
        return <span className="inline-flex items-center rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">Actief</span>;
    };

    return (
        <AppLayout>
            <Head title={sponsor.name} />

            {flash?.status && (
                <div className="mb-4 rounded-lg bg-emerald-900/50 border border-emerald-700/50 p-4">
                    <p className="text-sm text-emerald-300">{flash.status}</p>
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 rounded-lg bg-red-900/50 border border-red-700/50 p-4">
                    <p className="text-sm text-red-300">{flash.error}</p>
                </div>
            )}

            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/admin/sponsors" className="text-slate-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-white">{sponsor.name}</h1>
                            {tierObj && (
                                <span className={`inline-flex items-center rounded-full ${tierObj.bg} px-2.5 py-0.5 text-xs font-semibold ${tierObj.text}`}>
                                    {tierObj.label}
                                </span>
                            )}
                            {contractBadge()}
                            {sponsor.logo_url && (
                                <img src={sponsor.logo_url} alt={`${sponsor.name} logo`} className="w-8 h-8 rounded object-contain ring-1 ring-slate-600" />
                            )}
                        </div>
                        <p className="text-sm text-slate-400">{formatVat(sponsor.vat_number)} · {sponsor.legal_form || 'Onbekende rechtsvorm'}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {sponsor.vat_number && (
                        <button
                            onClick={handleRefresh}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            Vernieuwen
                        </button>
                    )}
                    <button
                        onClick={handleRenew}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-slate-700 ring-1 ring-slate-700 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" /></svg>
                        +1 jaar
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="rounded-lg bg-red-900/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/50 ring-1 ring-red-700/30 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Verwijderen
                    </button>
                </div>
                {sponsor.cbe_fetched_at && (
                    <p className="text-xs text-slate-500 mt-2">KBO gegevens opgehaald: {(() => { const [d, t] = sponsor.cbe_fetched_at.split(' '); return formatDate(d) + ' ' + (t || ''); })()}</p>
                )}
            </div>

            {/* Company Info + Contract */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Bedrijfsgegevens</h2>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <form onSubmit={handleSave}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Bedrijfsnaam</label>
                                    <input type="text" value={companyForm.data.name} onChange={(e) => companyForm.setData('name', e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                                </div>
                                <InfoItem label="Ondernemingsnummer" value={cbe?.cbe_number_formatted || formatVat(sponsor.vat_number)} />
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Rechtsvorm</label>
                                    <input type="text" value={companyForm.data.legal_form} onChange={(e) => companyForm.setData('legal_form', e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Straat + nummer</label>
                                    <input type="text" value={companyForm.data.address_street} onChange={(e) => companyForm.setData('address_street', e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Postcode</label>
                                    <input type="text" value={companyForm.data.address_postal_code} onChange={(e) => companyForm.setData('address_postal_code', e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Gemeente</label>
                                    <input type="text" value={companyForm.data.address_city} onChange={(e) => companyForm.setData('address_city', e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Telefoon</label>
                                    <input type="text" value={companyForm.data.phone} onChange={(e) => companyForm.setData('phone', e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">E-mail</label>
                                    <input type="text" value={companyForm.data.email} onChange={(e) => companyForm.setData('email', e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Website</label>
                                    <input type="text" value={companyForm.data.website} onChange={(e) => companyForm.setData('website', e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                                </div>
                                {cbe?.status && <InfoItem label="Status" value={cbe.status} />}
                                {cbe?.juridical_situation && <InfoItem label="Juridische situatie" value={cbe.juridical_situation} />}
                                {cbe?.type && <InfoItem label="Type" value={cbe.type} />}
                                {cbe?.start_date && <InfoItem label="Oprichtingsdatum" value={formatDate(cbe.start_date)} />}
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-800">
                                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Contactpersoon</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Naam contactpersoon</label>
                                        <input type="text" value={companyForm.data.contact_name} onChange={(e) => companyForm.setData('contact_name', e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="Naam" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Telefoon contactpersoon</label>
                                        <input type="text" value={companyForm.data.contact_phone} onChange={(e) => companyForm.setData('contact_phone', e.target.value)} className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="Telefoonnummer" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-800">
                                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Contractgegevens</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Sponsorformule</label>
                                        <select
                                            value={companyForm.data.tier}
                                            onChange={(e) => companyForm.setData('tier', e.target.value)}
                                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        >
                                            {TIERS.map((t) => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Sponsorbedrag (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={companyForm.data.sponsor_amount}
                                            onChange={(e) => companyForm.setData('sponsor_amount', e.target.value)}
                                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Startdatum</label>
                                        <input
                                            type="date"
                                            value={companyForm.data.contract_start_date}
                                            onChange={(e) => companyForm.setData('contract_start_date', e.target.value)}
                                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Einddatum</label>
                                        <input
                                            type="date"
                                            value={companyForm.data.contract_end_date}
                                            onChange={(e) => companyForm.setData('contract_end_date', e.target.value)}
                                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Hernieuwingstermijn</label>
                                        <select
                                            value={companyForm.data.renewal_months}
                                            onChange={(e) => companyForm.setData('renewal_months', e.target.value)}
                                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        >
                                            <option value="">Geen</option>
                                            <option value="6">6 maanden</option>
                                            <option value="12">12 maanden</option>
                                            <option value="24">24 maanden</option>
                                            <option value="36">36 maanden</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="mt-5 pt-4 border-t border-slate-800">
                                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Logo</p>
                                <div className="flex items-center gap-4">
                                    {(logoPreview || sponsor.logo_url) && !companyForm.data.remove_logo && (
                                        <div className="w-20 h-20 rounded-lg bg-white/5 ring-1 ring-slate-700 flex items-center justify-center overflow-hidden">
                                            <img src={logoPreview || sponsor.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        <label className="cursor-pointer rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700 inline-flex items-center gap-2 w-fit">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            Logo uploaden
                                            <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                                        </label>
                                        {(logoPreview || sponsor.has_logo) && (
                                            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={companyForm.data.remove_logo}
                                                    onChange={(e) => {
                                                        companyForm.setData('remove_logo', e.target.checked);
                                                        if (e.target.checked) setLogoPreview(null);
                                                    }}
                                                    className="rounded border-slate-600 bg-slate-800 text-rose-500 focus:ring-rose-500"
                                                />
                                                Logo verwijderen
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <button type="submit" disabled={companyForm.processing} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Opslaan
                                </button>
                            </div>
                        </form>
                    </div>
                    {sponsor.latitude && sponsor.longitude && (
                        <div className="lg:w-80 shrink-0 rounded-lg overflow-hidden ring-1 ring-slate-700">
                            <iframe
                                title="Locatie"
                                width="100%"
                                height="100%"
                                style={{ minHeight: '220px' }}
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${sponsor.longitude - 0.01},${sponsor.latitude - 0.01},${parseFloat(sponsor.longitude) + 0.01},${parseFloat(sponsor.latitude) + 0.01}&layer=mapnik&marker=${sponsor.latitude},${sponsor.longitude}`}
                            />
                        </div>
                    )}
                </div>

                {cbe?.nace_activities && cbe.nace_activities.length > 0 && (
                    <div className="mt-5">
                        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">NACE-activiteiten</p>
                        <div className="space-y-1">
                            {cbe.nace_activities.map((a, i) => (
                                <p key={i} className="text-sm text-slate-300">
                                    <span className="text-slate-500 font-mono text-xs">{a.code}</span> — {a.description}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {cbe?.establishments && cbe.establishments.length > 0 && (
                    <div className="mt-5">
                        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Vestigingen</p>
                        <div className="space-y-2">
                            {cbe.establishments.map((e, i) => (
                                <div key={i} className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3">
                                    <p className="text-sm font-medium text-white">{e.denomination || `Vestiging ${i + 1}`}</p>
                                    {e.cbe_number && <p className="text-xs text-slate-500">{e.cbe_number}</p>}
                                    {e.address && <p className="text-xs text-slate-400 mt-1">{e.address}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-xl ring-1 ring-slate-700 w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Sponsor verwijderen</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Weet je zeker dat je <strong>{sponsor.name}</strong> wilt verwijderen?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Verwijderen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-sm text-white mt-0.5">{value || '-'}</p>
        </div>
    );
}
