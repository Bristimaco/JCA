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

export default function ProspectDetail({ prospect }) {
    return <ProspectDetailContent key={prospect.id + '-' + (prospect.cbe_fetched_at || 'none')} prospect={prospect} />;
}

function ProspectDetailContent({ prospect }) {
    const { flash } = usePage().props;
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const noteForm = useForm({ content: '' });
    const companyForm = useForm({
        address_street: prospect.address_street || '',
        address_city: prospect.address_city || '',
        address_postal_code: prospect.address_postal_code || '',
        legal_form: prospect.legal_form || '',
        phone: prospect.phone || '',
        email: prospect.email || '',
        website: prospect.website || '',
        contact_name: prospect.contact_name || '',
        contact_phone: prospect.contact_phone || '',
    });
    const sponsorForm = useForm({
        sponsor_amount: prospect.sponsor_amount || '',
        sponsor_start_date: prospect.sponsor_start_date || '',
        sponsor_renewal_months: prospect.sponsor_renewal_months || '',
        sponsor_tier: prospect.sponsor_tier || '',
        logo: '',
        remove_logo: false,
    });

    const cbe = prospect.cbe_data;
    const isArchived = !!prospect.archived_at;

    const handleAddNote = (e) => {
        e.preventDefault();
        noteForm.post(`/admin/prospectie/${prospect.id}/notes`, {
            preserveScroll: true,
            onSuccess: () => noteForm.reset('content'),
        });
    };

    const handleDeleteNote = (noteId) => {
        if (!confirm('Notitie verwijderen?')) return;
        router.delete(`/admin/prospectie/${prospect.id}/notes/${noteId}`, { preserveScroll: true });
    };

    const handleRefresh = () => {
        router.post(`/admin/prospectie/${prospect.id}/refresh`, {}, { preserveScroll: true });
    };

    const handleConvert = () => {
        sponsorForm.put(`/admin/prospectie/${prospect.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                router.post(`/admin/prospectie/${prospect.id}/convert`, {}, {
                    preserveScroll: true,
                    onSuccess: () => setShowConvertModal(false),
                });
            },
        });
    };

    const handleDelete = () => {
        router.delete(`/admin/prospectie/${prospect.id}`);
    };

    const handleArchive = () => {
        router.post(`/admin/prospectie/${prospect.id}/archive`, {}, {
            preserveScroll: true,
            onSuccess: () => setShowArchiveModal(false),
        });
    };

    const handleUnarchive = () => {
        router.post(`/admin/prospectie/${prospect.id}/unarchive`, {}, { preserveScroll: true });
    };

    const handleSaveSponsor = (e) => {
        e.preventDefault();
        sponsorForm.put(`/admin/prospectie/${prospect.id}`, { preserveScroll: true });
    };

    const handleSaveCompany = (e) => {
        e.preventDefault();
        companyForm.put(`/admin/prospectie/${prospect.id}`, { preserveScroll: true });
    };

    const handleLogo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const dataUrl = await resizeImage(file);
        sponsorForm.setData('logo', dataUrl);
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

    return (
        <AppLayout>
            <Head title={prospect.company_name} />

            {flash?.status && (
                <div className="mb-4 rounded-lg bg-emerald-900/50 border border-emerald-700/50 p-4">
                    <p className="text-sm text-emerald-300">{flash.status}</p>
                </div>
            )}

            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/admin/prospectie" className="text-slate-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white">{prospect.company_name}</h1>
                            {isArchived && (
                                <span className="inline-flex items-center rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                                    Gearchiveerd{prospect.archived_reason === 'converted' ? ' — Omgezet' : prospect.archived_reason === 'no_sponsor' ? ' — Geen sponsor' : ''}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400">{formatVat(prospect.vat_number)} · {prospect.legal_form || 'Onbekende rechtsvorm'}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleRefresh}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Vernieuwen
                    </button>
                    {!isArchived && (
                        <>
                            <button
                                onClick={() => setShowConvertModal(true)}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                                Omzetten naar sponsor
                            </button>
                            <button
                                onClick={() => setShowArchiveModal(true)}
                                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-slate-700 ring-1 ring-slate-700 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                Archiveren
                            </button>
                        </>
                    )}
                    {isArchived && (
                        <button
                            onClick={handleUnarchive}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-slate-700 ring-1 ring-slate-700 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                            Heractiveren
                        </button>
                    )}
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="rounded-lg bg-red-900/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/50 ring-1 ring-red-700/30 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Verwijderen
                    </button>
                </div>
                {prospect.cbe_fetched_at && (
                    <p className="text-xs text-slate-500 mt-2">KBO gegevens opgehaald: {(() => { const [d, t] = prospect.cbe_fetched_at.split(' '); return formatDate(d) + ' ' + (t || ''); })()}</p>
                )}
            </div>

            {/* Company Info */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Bedrijfsgegevens</h2>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <form onSubmit={handleSaveCompany}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <InfoItem label="Bedrijfsnaam" value={prospect.company_name} />
                                <InfoItem label="Ondernemingsnummer" value={cbe?.cbe_number_formatted || formatVat(prospect.vat_number)} />
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

                            <div className="flex justify-end mt-4">
                                <button type="submit" disabled={companyForm.processing} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Opslaan
                                </button>
                            </div>
                        </form>
                    </div>
                    {prospect.latitude && prospect.longitude && (
                        <div className="lg:w-80 shrink-0 rounded-lg overflow-hidden ring-1 ring-slate-700">
                            <iframe
                                title="Locatie"
                                width="100%"
                                height="100%"
                                style={{ minHeight: '220px' }}
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${prospect.longitude - 0.01},${prospect.latitude - 0.01},${parseFloat(prospect.longitude) + 0.01},${parseFloat(prospect.latitude) + 0.01}&layer=mapnik&marker=${prospect.latitude},${prospect.longitude}`}
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

            {/* Sponsor Fields */}
            {!isArchived && (
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Sponsorgegevens</h2>
                    <form onSubmit={handleSaveSponsor}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Sponsorbedrag (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={sponsorForm.data.sponsor_amount}
                                    onChange={(e) => sponsorForm.setData('sponsor_amount', e.target.value)}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                                {sponsorForm.errors.sponsor_amount && <p className="text-xs text-red-400 mt-1">{sponsorForm.errors.sponsor_amount}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Startdatum</label>
                                <input
                                    type="date"
                                    value={sponsorForm.data.sponsor_start_date}
                                    onChange={(e) => sponsorForm.setData('sponsor_start_date', e.target.value)}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                />
                                {sponsorForm.errors.sponsor_start_date && <p className="text-xs text-red-400 mt-1">{sponsorForm.errors.sponsor_start_date}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Hernieuwingstermijn</label>
                                <select
                                    value={sponsorForm.data.sponsor_renewal_months}
                                    onChange={(e) => sponsorForm.setData('sponsor_renewal_months', e.target.value)}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                >
                                    <option value="">— Kies —</option>
                                    <option value="6">6 maanden</option>
                                    <option value="12">12 maanden</option>
                                    <option value="24">24 maanden</option>
                                    <option value="36">36 maanden</option>
                                </select>
                                {sponsorForm.errors.sponsor_renewal_months && <p className="text-xs text-red-400 mt-1">{sponsorForm.errors.sponsor_renewal_months}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Sponsorformule</label>
                                <select
                                    value={sponsorForm.data.sponsor_tier}
                                    onChange={(e) => sponsorForm.setData('sponsor_tier', e.target.value)}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                >
                                    <option value="">— Kies —</option>
                                    <option value="bronze">Brons</option>
                                    <option value="silver">Zilver</option>
                                    <option value="gold">Goud</option>
                                </select>
                                {sponsorForm.errors.sponsor_tier && <p className="text-xs text-red-400 mt-1">{sponsorForm.errors.sponsor_tier}</p>}
                            </div>
                        </div>

                        {/* Logo upload */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-slate-400 mb-2">Logo</label>
                            <div className="flex items-center gap-4">
                                {(logoPreview || prospect.logo_url) && (
                                    <div className="w-20 h-20 rounded-lg bg-white/5 ring-1 ring-slate-700 flex items-center justify-center overflow-hidden">
                                        <img src={logoPreview || prospect.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <label className="cursor-pointer rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700 inline-flex items-center gap-2 w-fit">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        Logo uploaden
                                        <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                                    </label>
                                    {(logoPreview || prospect.has_logo) && (
                                        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sponsorForm.data.remove_logo}
                                                onChange={(e) => {
                                                    sponsorForm.setData('remove_logo', e.target.checked);
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

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={sponsorForm.processing}
                                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Opslaan
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Communication Log */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Communicatie log</h2>

                <form onSubmit={handleAddNote} className="mb-6">
                    <textarea
                        value={noteForm.data.content}
                        onChange={(e) => noteForm.setData('content', e.target.value)}
                        rows={3}
                        maxLength={5000}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none placeholder-slate-500"
                        placeholder="Notitie toevoegen (bv. telefonisch contact, e-mail, vergadering...)"
                    />
                    {noteForm.errors.content && (
                        <p className="mt-1 text-sm text-red-400">{noteForm.errors.content}</p>
                    )}
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={noteForm.processing || !noteForm.data.content.trim()}
                            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Toevoegen
                        </button>
                    </div>
                </form>

                {prospect.notes.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">Nog geen notities.</p>
                ) : (
                    <div className="space-y-3">
                        {prospect.notes.map((note) => (
                            <div key={note.id} className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-200 whitespace-pre-wrap">{note.content}</p>
                                        <p className="text-xs text-slate-500 mt-2">{note.creator_name} · {note.created_at}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="shrink-0 text-slate-500 hover:text-red-400"
                                        title="Verwijderen"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Convert Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-xl ring-1 ring-slate-700 w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Omzetten naar sponsor</h3>
                        <p className="text-sm text-slate-400 mb-3">
                            <strong>{prospect.company_name}</strong> wordt als nieuwe sponsor aangemaakt.
                        </p>
                        {(sponsorForm.data.sponsor_tier || sponsorForm.data.sponsor_amount || sponsorForm.data.sponsor_start_date) ? (
                            <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3 mb-4 space-y-1">
                                {sponsorForm.data.sponsor_tier && (
                                    <p className="text-sm text-slate-300">Formule: <span className="text-white font-medium">{{ bronze: 'Brons', silver: 'Zilver', gold: 'Goud' }[sponsorForm.data.sponsor_tier]}</span></p>
                                )}
                                {sponsorForm.data.sponsor_amount && (
                                    <p className="text-sm text-slate-300">Bedrag: <span className="text-white font-medium">€{sponsorForm.data.sponsor_amount}</span></p>
                                )}
                                {sponsorForm.data.sponsor_start_date && (
                                    <p className="text-sm text-slate-300">Startdatum: <span className="text-white font-medium">{formatDate(sponsorForm.data.sponsor_start_date)}</span></p>
                                )}
                                {sponsorForm.data.sponsor_renewal_months && (
                                    <p className="text-sm text-slate-300">Hernieuwing: <span className="text-white font-medium">{sponsorForm.data.sponsor_renewal_months} maanden</span></p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-amber-400 mb-4">Let op: er zijn geen sponsorgegevens ingevuld. Sla eerst de sponsorgegevens op voordat je omzet.</p>
                        )}
                        <p className="text-sm text-slate-500 mb-4">Na het omzetten wordt het prospect automatisch gearchiveerd.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConvertModal(false)}
                                className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleConvert}
                                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                Omzetten
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-xl ring-1 ring-slate-700 w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Prospect verwijderen</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Weet je zeker dat je <strong>{prospect.company_name}</strong> wilt verwijderen? Alle notities worden ook verwijderd.
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

            {/* Archive Modal */}
            {showArchiveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-xl ring-1 ring-slate-700 w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Prospect archiveren</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            <strong>{prospect.company_name}</strong> wordt gearchiveerd met de status &quot;Geen sponsor&quot;. Je kunt dit later ongedaan maken.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowArchiveModal(false)}
                                className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleArchive}
                                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                            >
                                Archiveren
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function InfoItem({ label, value, extra, link }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            {link && value ? (
                <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm text-rose-400 hover:text-rose-300 mt-0.5 block">{value}</a>
            ) : (
                <p className="text-sm text-white mt-0.5">{value || '-'}</p>
            )}
            {extra && <p className="text-xs text-slate-500 mt-0.5">{extra}</p>}
        </div>
    );
}
