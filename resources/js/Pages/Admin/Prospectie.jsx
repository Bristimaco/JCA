import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function Prospectie({ prospects }) {
    const [lookupResult, setLookupResult] = useState(null);
    const [lookupError, setLookupError] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [vatInput, setVatInput] = useState('');
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

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

            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-slate-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Prospectie</h1>
                            <p className="text-sm text-slate-400 mt-1">Zoek bedrijven op via de KBO en beheer prospecten</p>
                        </div>
                    </div>
                    <div>
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
                            <InfoItem label="Status" value={lookupResult.status} />
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
                <div className="px-6 py-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-white">Prospecten ({prospects.length})</h2>
                </div>
                {prospects.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-sm text-slate-500">Nog geen prospecten opgeslagen.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Bedrijf</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Ondernemingsnr.</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Stad</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">E-mail</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Notities</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Toegevoegd</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {prospects.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-800/50 cursor-pointer" onClick={() => router.visit(`/admin/prospectie/${p.id}`)}>
                                        <td className="px-6 py-3">
                                            <p className="text-sm font-medium text-white">{p.company_name}</p>
                                            {p.legal_form && <p className="text-xs text-slate-500">{p.legal_form}</p>}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-slate-300">{formatVat(p.vat_number)}</td>
                                        <td className="px-6 py-3 text-sm text-slate-300">{p.address_city || '-'}</td>
                                        <td className="px-6 py-3 text-sm text-slate-300">{p.email || '-'}</td>
                                        <td className="px-6 py-3">
                                            {p.notes_count > 0 && (
                                                <span className="inline-flex items-center rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">{p.notes_count}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-slate-400">{p.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
