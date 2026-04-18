import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function Prospectie({ prospects, filter }) {
    const { flash } = usePage().props;
    const [lookupResult, setLookupResult] = useState(null);
    const [lookupError, setLookupError] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [vatInput, setVatInput] = useState('');
    const [importing, setImporting] = useState(false);
    const [search, setSearch] = useState('');
    const fileInputRef = useRef(null);

    const filtered = prospects.filter((p) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (p.company_name && p.company_name.toLowerCase().includes(q)) ||
            (p.city && p.city.toLowerCase().includes(q)) ||
            (p.email && p.email.toLowerCase().includes(q)) ||
            (p.phone && p.phone.toLowerCase().includes(q)) ||
            (p.vat_number && p.vat_number.toLowerCase().includes(q))
        );
    });

    const saveForm = useForm({
        vat_number: '',
        company_name: '',
        address_street: '',
        address_city: '',
        address_postal_code: '',
        legal_form: '',
        phone: '',
        email: '',
        website: '',
        cbe_data: null,
    });

    const handleLookup = async () => {
        if (!vatInput.trim()) return;
        setLookupLoading(true);
        setLookupError(null);
        setLookupResult(null);

        try {
            const response = await fetch('/admin/prospectie/lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ vat_number: vatInput }),
            });
            const data = await response.json();
            if (data.success) {
                setLookupResult(data.data);
            } else {
                setLookupError(data.error || 'Bedrijf niet gevonden.');
            }
        } catch {
            setLookupError('Fout bij het opzoeken. Probeer opnieuw.');
        } finally {
            setLookupLoading(false);
        }
    };

    const handleSaveProspect = () => {
        if (!lookupResult) return;
        router.post('/admin/prospectie', {
            vat_number: lookupResult.vat_number,
            company_name: lookupResult.company_name,
            address_street: lookupResult.address_street || '',
            address_city: lookupResult.address_city || '',
            address_postal_code: lookupResult.address_postal_code || '',
            legal_form: lookupResult.legal_form || '',
            phone: lookupResult.phone || '',
            email: lookupResult.email || '',
            website: lookupResult.website || '',
            latitude: lookupResult.latitude || null,
            longitude: lookupResult.longitude || null,
            cbe_data: lookupResult,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setLookupResult(null);
                setVatInput('');
            },
        });
    };

    const formatVat = (vat) => {
        if (!vat) return '-';
        const str = String(vat);
        if (str.length === 10) return `BE ${str.slice(0,4)}.${str.slice(4,7)}.${str.slice(7)}`;
        if (str.length === 9) return `BE 0${str.slice(0,3)}.${str.slice(3,6)}.${str.slice(6)}`;
        return `BE ${str}`;
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImporting(true);
        router.post('/admin/prospectie/import', { file }, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Prospectie" />

            {flash.status && (
                <div className="mb-4 rounded-md bg-emerald-900/30 ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}

            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Prospectie</h1>
                        <p className="text-sm text-slate-400 mt-1">Zoek bedrijven op via de KBO en beheer prospecten</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="file" ref={fileInputRef} accept=".xlsx" onChange={handleImport} className="hidden" />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            {importing ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    Importeren...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    Import Excel
                                </>
                            )}
                        </button>
                        <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                            ← Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            {/* Lookup Section */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Bedrijf opzoeken</h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={vatInput}
                        onChange={(e) => setVatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                        placeholder="Ondernemingsnummer (bv. 0123456789)"
                        className="flex-1 rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder-slate-500"
                    />
                    <button
                        onClick={handleLookup}
                        disabled={lookupLoading || !vatInput.trim()}
                        className="rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {lookupLoading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                Opzoeken...
                            </>
                        ) : 'Opzoeken'}
                    </button>
                </div>

                {lookupError && (
                    <div className="mt-4 rounded-lg bg-red-900/30 border border-red-700/50 p-4">
                        <p className="text-sm text-red-400">{lookupError}</p>
                    </div>
                )}

                {lookupResult && (
                    <div className="mt-4 rounded-lg bg-slate-800/50 border border-slate-700 p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{lookupResult.company_name}</h3>
                                {lookupResult.commercial_name && lookupResult.commercial_name !== lookupResult.company_name && (
                                    <p className="text-sm text-slate-400">{lookupResult.commercial_name}</p>
                                )}
                            </div>
                            <button
                                onClick={handleSaveProspect}
                                disabled={saveForm.processing}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                Toevoegen als prospect
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoItem label="Ondernemingsnummer" value={lookupResult.cbe_number_formatted || formatVat(lookupResult.vat_number)} />
                            <InfoItem label="Rechtsvorm" value={lookupResult.legal_form} />
                            <InfoItem label="KBO Status" value={lookupResult.status} />
                            <InfoItem label="Adres" value={lookupResult.full_address || [lookupResult.address_street, lookupResult.address_postal_code, lookupResult.address_city].filter(Boolean).join(', ')} />
                            <InfoItem label="Telefoon" value={lookupResult.phone} />
                            <InfoItem label="E-mail" value={lookupResult.email} />
                            <InfoItem label="Website" value={lookupResult.website} />
                            <InfoItem label="Juridische situatie" value={lookupResult.juridical_situation} />
                            <InfoItem label="Type" value={lookupResult.type} />
                            {lookupResult.start_date && <InfoItem label="Oprichtingsdatum" value={lookupResult.start_date} />}
                        </div>

                        {lookupResult.nace_activities && lookupResult.nace_activities.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs font-semibold text-slate-400 mb-2">NACE-activiteiten</p>
                                <div className="space-y-1">
                                    {lookupResult.nace_activities.slice(0, 5).map((a, i) => (
                                        <p key={i} className="text-xs text-slate-300">
                                            <span className="text-slate-500">{a.code}</span> — {a.description}
                                        </p>
                                    ))}
                                    {lookupResult.nace_activities.length > 5 && (
                                        <p className="text-xs text-slate-500">+ {lookupResult.nace_activities.length - 5} meer</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {lookupResult.latitude && lookupResult.longitude && (
                            <div className="mt-4 rounded-lg overflow-hidden ring-1 ring-slate-700">
                                <iframe
                                    title="Locatie"
                                    width="100%"
                                    height="220"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${lookupResult.longitude - 0.01},${lookupResult.latitude - 0.01},${parseFloat(lookupResult.longitude) + 0.01},${parseFloat(lookupResult.latitude) + 0.01}&layer=mapnik&marker=${lookupResult.latitude},${lookupResult.longitude}`}
                                />
                            </div>
                        )}

                        {saveForm.errors.vat_number && (
                            <p className="mt-3 text-sm text-red-400">{saveForm.errors.vat_number}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Prospect List */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-lg font-semibold text-white">Prospecten ({filtered.length})</h2>
                    <input
                        type="text"
                        placeholder="Zoeken op naam, stad, BTW..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 w-56"
                    />
                    <div className="flex rounded-lg bg-slate-800 p-0.5 ring-1 ring-slate-700">
                        <button
                            onClick={() => router.get('/admin/prospectie', { filter: 'actief' }, { preserveState: true })}
                            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${filter === 'actief' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Actief
                        </button>
                        <button
                            onClick={() => router.get('/admin/prospectie', { filter: 'inactief' }, { preserveState: true })}
                            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${filter === 'inactief' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Inactief
                        </button>
                        <button
                            onClick={() => router.get('/admin/prospectie', { filter: 'gearchiveerd' }, { preserveState: true })}
                            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${filter === 'gearchiveerd' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Gearchiveerd
                        </button>
                    </div>
                </div>
                {filtered.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-slate-500">{search ? 'Geen prospecten gevonden.' : 'Nog geen prospecten opgeslagen.'}</p>
                    </div>
                ) : (
                    <>
                    {/* Desktop table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Bedrijf</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Ondernemingsnr.</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">KBO Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Stad</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Telefoon</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">E-mail</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Notities</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Toegevoegd</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-800/50 cursor-pointer" onClick={() => router.visit(`/admin/prospectie/${p.id}`)}>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{p.company_name}</p>
                                                    {p.legal_form && <p className="text-xs text-slate-500">{p.legal_form}</p>}
                                                </div>
                                                {filter === 'gearchiveerd' && p.archived_reason && (
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.archived_reason === 'converted' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                                        {p.archived_reason === 'converted' ? 'Omgezet' : 'Geen sponsor'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-slate-300">{formatVat(p.vat_number)}</td>
                                        <td className="px-6 py-3 text-sm text-slate-300">{p.cbe_status || '-'}</td>
                                        <td className="px-6 py-3 text-sm text-slate-300">{p.address_city || '-'}</td>
                                        <td className="px-6 py-3 text-sm text-slate-300">{p.phone || '-'}</td>
                                        <td className="px-6 py-3 text-sm text-slate-300">{p.email || '-'}</td>
                                        <td className="px-6 py-3">
                                            {p.notes_count > 0 && (
                                                <span className="inline-flex items-center rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">{p.notes_count}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-slate-400">{p.created_at}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-1">
                                                {filter === 'inactief' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); router.post(`/admin/prospectie/${p.id}/activate`, {}, { preserveScroll: true }); }}
                                                        className="rounded-md bg-emerald-900/30 p-1.5 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                                                        title="Activeren"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    </button>
                                                )}
                                                {filter === 'actief' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); router.post(`/admin/prospectie/${p.id}/deactivate`, {}, { preserveScroll: true }); }}
                                                        className="rounded-md bg-slate-700 p-1.5 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors"
                                                        title="Deactiveren"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); router.post(`/admin/prospectie/${p.id}/refresh`, {}, { preserveScroll: true }); }}
                                                    className="rounded-md bg-slate-700 p-1.5 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                                                    title="Vernieuwen"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); if (confirm(`'${p.company_name}' verwijderen?`)) router.delete(`/admin/prospectie/${p.id}`, { preserveScroll: true }); }}
                                                    className="rounded-md bg-slate-700 p-1.5 text-slate-400 hover:bg-red-600 hover:text-white transition-colors"
                                                    title="Verwijderen"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="lg:hidden divide-y divide-slate-800">
                        {filtered.map((p) => (
                            <div key={p.id} className="px-4 py-3 space-y-2 active:bg-slate-800/50 cursor-pointer" onClick={() => router.visit(`/admin/prospectie/${p.id}`)}>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{p.company_name}</p>
                                        {filter === 'gearchiveerd' && p.archived_reason && (
                                            <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.archived_reason === 'converted' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                                {p.archived_reason === 'converted' ? 'Omgezet' : 'Geen sponsor'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {filter === 'inactief' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); router.post(`/admin/prospectie/${p.id}/activate`, {}, { preserveScroll: true }); }}
                                                className="rounded-md bg-emerald-900/30 p-1.5 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                                                title="Activeren"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </button>
                                        )}
                                        {filter === 'actief' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); router.post(`/admin/prospectie/${p.id}/deactivate`, {}, { preserveScroll: true }); }}
                                                className="rounded-md bg-slate-700 p-1.5 text-amber-400 hover:bg-amber-600 hover:text-white transition-colors"
                                                title="Deactiveren"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); router.post(`/admin/prospectie/${p.id}/refresh`, {}, { preserveScroll: true }); }}
                                            className="rounded-md bg-slate-700 p-1.5 text-slate-400 hover:bg-slate-600 hover:text-white transition-colors"
                                            title="Vernieuwen"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); if (confirm(`'${p.company_name}' verwijderen?`)) router.delete(`/admin/prospectie/${p.id}`, { preserveScroll: true }); }}
                                            className="rounded-md bg-slate-700 p-1.5 text-slate-400 hover:bg-red-600 hover:text-white transition-colors"
                                            title="Verwijderen"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                                {p.legal_form && <p className="text-xs text-slate-500">{p.legal_form}</p>}
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                                    {p.cbe_status && <span>{p.cbe_status}</span>}
                                    {p.address_city && <span>{p.address_city}</span>}
                                    {p.phone && <span>{p.phone}</span>}
                                    {p.email && <span className="text-slate-300">{p.email}</span>}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                    {p.vat_number && <span>{formatVat(p.vat_number)}</span>}
                                    {p.notes_count > 0 && <span className="inline-flex items-center rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">{p.notes_count} notities</span>}
                                    <span>{p.created_at}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function InfoItem({ label, value, extra }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-sm text-white mt-0.5">{value || '-'}</p>
            {extra && <p className="text-xs text-slate-500 mt-0.5">{extra}</p>}
        </div>
    );
}
