import { usePage, router, Link } from '@inertiajs/react';

const TIERS = [
    { value: 'bronze', label: 'Brons', bg: 'bg-amber-900/40', text: 'text-amber-300' },
    { value: 'silver', label: 'Zilver', bg: 'bg-slate-600/50', text: 'text-slate-200' },
    { value: 'gold', label: 'Goud', bg: 'bg-yellow-900/40', text: 'text-yellow-400' },
];

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
                    {sponsors.map((s) => (
                        <SponsorRow key={s.id} sponsor={s} />
                    ))}
                </div>
            )}
        </>
    );
}

function SponsorRow({ sponsor: s }) {
    return (
        <div className="px-3 sm:px-6 py-4 flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-white">{s.name}</h4>
                    {tierBadge(s.tier)}
                    {contractBadge(s)}
                    {s.logo_url && (
                        <img src={s.logo_url} alt={`${s.name} logo`} className="w-8 h-8 rounded object-contain ring-1 ring-slate-600" />
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
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        router.post(`/admin/sponsors/${s.id}/renew`, {}, { preserveScroll: true });
                    }}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                    +1 jaar
                </button>
                <Link href={`/admin/sponsors/${s.id}`} className="text-xs font-medium text-rose-400 hover:text-rose-300">
                    Bewerken
                </Link>
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
