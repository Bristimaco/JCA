import { useForm } from '@inertiajs/react';
import { useState } from 'react';

function DimensionConfig({ index, form }) {
    const key = `dimension_${index}`;
    const dimension = form.data[key] || { name: '', values: [] };
    const [newValue, setNewValue] = useState('');

    const update = (field, val) => {
        form.setData(key, { ...dimension, [field]: val });
    };

    const addValue = () => {
        const trimmed = newValue.trim();
        if (!trimmed || dimension.values.includes(trimmed)) return;
        update('values', [...dimension.values, trimmed]);
        setNewValue('');
    };

    const removeValue = (val) => {
        update('values', dimension.values.filter(v => v !== val));
    };

    return (
        <div className="rounded-lg bg-slate-800/30 ring-1 ring-slate-700/40 p-4">
            <label className="block text-xs font-medium text-slate-400 mb-1">Dimensie {index} — Naam</label>
            <input
                type="text"
                value={dimension.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder={`Bijv. Kostenplaats, Categorie...`}
                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
            />
            {form.errors[`${key}.name`] && <p className="text-sm text-red-400 mt-1">{form.errors[`${key}.name`]}</p>}

            {dimension.name && (
                <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Waardes</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {dimension.values.map((val) => (
                            <span key={val} className="inline-flex items-center gap-1 rounded-md bg-slate-700 px-2 py-1 text-xs text-slate-200 ring-1 ring-slate-600">
                                {val}
                                <button type="button" onClick={() => removeValue(val)} className="text-slate-400 hover:text-red-400">&times;</button>
                            </span>
                        ))}
                        {dimension.values.length === 0 && <span className="text-xs text-slate-500">Nog geen waardes</span>}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addValue(); } }}
                            placeholder="Nieuwe waarde..."
                            className="flex-1 rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                        <button type="button" onClick={addValue}
                            className="rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-600 ring-1 ring-slate-600">
                            +
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ClubSettingsSection({ clubSettings }) {
    const form = useForm({
        name: clubSettings.name || '',
        address_street: clubSettings.address_street || '',
        address_city: clubSettings.address_city || '',
        address_postal_code: clubSettings.address_postal_code || '',
        attendance_pin: clubSettings.attendance_pin || '',
        attendance_threshold: clubSettings.attendance_threshold ?? 70,
        default_membership_fee: clubSettings.default_membership_fee || '',
        sponsor_frequency_bronze: clubSettings.sponsor_frequency_bronze ?? 60,
        sponsor_frequency_silver: clubSettings.sponsor_frequency_silver ?? 30,
        sponsor_frequency_gold: clubSettings.sponsor_frequency_gold ?? 15,
        slide_duration_results: clubSettings.slide_duration_results ?? 15,
        slide_duration_announcements: clubSettings.slide_duration_announcements ?? 15,
        mollie_expiry_days: clubSettings.mollie_expiry_days ?? 14,
        test_mode: clubSettings.test_mode ?? false,
        dimension_1: clubSettings.dimension_1 || { name: '', values: [] },
        dimension_2: clubSettings.dimension_2 || { name: '', values: [] },
        dimension_3: clubSettings.dimension_3 || { name: '', values: [] },
        bank_accounts: clubSettings.bank_accounts || [],
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
            forceFormData: form.data.logo instanceof File,
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Standaard lidgeld (€)</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.data.default_membership_fee}
                    onChange={(e) => form.setData('default_membership_fee', e.target.value)}
                    className="w-full max-w-xs rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Voor leden die niet in een trainingsgroep zitten</p>
                {form.errors.default_membership_fee && <p className="text-sm text-red-400 mt-1">{form.errors.default_membership_fee}</p>}
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

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sponsor weergavefrequentie (seconden)</label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">🥉 Brons</label>
                        <input
                            type="number"
                            min="5"
                            value={form.data.sponsor_frequency_bronze}
                            onChange={(e) => form.setData('sponsor_frequency_bronze', parseInt(e.target.value) || 60)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">🥈 Zilver</label>
                        <input
                            type="number"
                            min="5"
                            value={form.data.sponsor_frequency_silver}
                            onChange={(e) => form.setData('sponsor_frequency_silver', parseInt(e.target.value) || 30)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">🥇 Goud</label>
                        <input
                            type="number"
                            min="5"
                            value={form.data.sponsor_frequency_gold}
                            onChange={(e) => form.setData('sponsor_frequency_gold', parseInt(e.target.value) || 15)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                    </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Hoe vaak een sponsorlogo verschijnt op het resultaten scherm (lagere waarde = vaker)</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Slidetijd resultaten scherm (seconden)</label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">🏆 Resultaten</label>
                        <input
                            type="number"
                            min="5"
                            value={form.data.slide_duration_results}
                            onChange={(e) => form.setData('slide_duration_results', parseInt(e.target.value) || 15)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">📢 Mededelingen</label>
                        <input
                            type="number"
                            min="5"
                            value={form.data.slide_duration_announcements}
                            onChange={(e) => form.setData('slide_duration_announcements', parseInt(e.target.value) || 15)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                    </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Hoe lang elke slide wordt getoond op het kiosk resultaten scherm</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Vervaldagen betaallinks (dagen)</label>
                <input
                    type="number"
                    min="1"
                    max="365"
                    value={form.data.mollie_expiry_days}
                    onChange={(e) => form.setData('mollie_expiry_days', parseInt(e.target.value) || 14)}
                    className="w-full max-w-xs rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Aantal dagen waarna een Mollie betaallink automatisch vervalt</p>
                {form.errors.mollie_expiry_days && <p className="text-sm text-red-400 mt-1">{form.errors.mollie_expiry_days}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bankrekeningen</label>
                <p className="text-xs text-slate-500 mb-3">Voeg bankrekeningen toe om CODA bestanden te importeren en verrichtingen per rekening te filteren</p>
                <div className="space-y-3">
                    {form.data.bank_accounts.map((acc, idx) => (
                        <div key={idx} className="rounded-lg bg-slate-800/30 ring-1 ring-slate-700/40 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">Naam</label>
                                        <input
                                            type="text"
                                            value={acc.name}
                                            onChange={(e) => {
                                                const updated = [...form.data.bank_accounts];
                                                updated[idx] = { ...updated[idx], name: e.target.value };
                                                form.setData('bank_accounts', updated);
                                            }}
                                            placeholder="Bijv. Hoofdrekening, Spaarrekening..."
                                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                                        />
                                        {form.errors[`bank_accounts.${idx}.name`] && <p className="text-sm text-red-400 mt-1">{form.errors[`bank_accounts.${idx}.name`]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">IBAN</label>
                                        <input
                                            type="text"
                                            value={acc.account_number}
                                            onChange={(e) => {
                                                const updated = [...form.data.bank_accounts];
                                                updated[idx] = { ...updated[idx], account_number: e.target.value };
                                                form.setData('bank_accounts', updated);
                                            }}
                                            placeholder="BE00 0000 0000 0000"
                                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm font-mono"
                                        />
                                        {form.errors[`bank_accounts.${idx}.account_number`] && <p className="text-sm text-red-400 mt-1">{form.errors[`bank_accounts.${idx}.account_number`]}</p>}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => form.setData('bank_accounts', form.data.bank_accounts.filter((_, i) => i !== idx))}
                                    className="mt-6 text-slate-400 hover:text-red-400"
                                    title="Verwijderen"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => form.setData('bank_accounts', [...form.data.bank_accounts, { name: '', account_number: '' }])}
                        className="rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-600 ring-1 ring-slate-600"
                    >
                        + Rekening toevoegen
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Analytische Dimensies</label>
                <p className="text-xs text-slate-500 mb-3">Definieer tot 3 dimensies om bankverrichtingen te categoriseren (bijv. Kostenplaats, Project, Afdeling)</p>
                <div className="space-y-3">
                    <DimensionConfig index={1} form={form} />
                    <DimensionConfig index={2} form={form} />
                    <DimensionConfig index={3} form={form} />
                </div>
            </div>

            <div className={`rounded-lg p-4 ring-1 ${form.data.test_mode ? 'bg-amber-900/20 ring-amber-600/40' : 'bg-slate-800/30 ring-slate-700/40'}`}>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={form.data.test_mode}
                        onChange={(e) => form.setData('test_mode', e.target.checked)}
                        className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                        <span className="text-sm font-medium text-white">Test modus</span>
                        <p className="text-xs text-slate-400 mt-0.5">Wanneer actief worden notificaties, e-mails en Mollie betaallinks niet verstuurd maar gelogd.</p>
                    </div>
                </label>
                {form.data.test_mode && (
                    <p className="mt-2 text-xs font-medium text-amber-400">⚠️ Test modus is actief — notificaties en betalingen worden geblokkeerd!</p>
                )}
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
