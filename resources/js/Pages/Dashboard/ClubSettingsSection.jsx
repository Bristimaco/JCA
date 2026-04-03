import { useForm } from '@inertiajs/react';
import { useState } from 'react';

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
            forceFormData: true,
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
