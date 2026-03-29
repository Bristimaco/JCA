import { useState } from 'react';
import { Link } from '@inertiajs/react';

const statusColors = {
    active: 'bg-emerald-900/30 text-emerald-400',
    redeemed: 'bg-slate-700/50 text-slate-400',
    expired: 'bg-red-900/30 text-red-400',
};

const statusLabels = {
    active: 'Actief',
    redeemed: 'Verbruikt',
    expired: 'Verlopen',
};

export default function VouchersSection({ vouchers }) {
    const [filter, setFilter] = useState('all');
    const [redeeming, setRedeeming] = useState(null);
    const [flash, setFlash] = useState(null);

    const filtered = filter === 'all' ? vouchers : vouchers.filter(v => v.status === filter);

    const counts = {
        all: vouchers.length,
        active: vouchers.filter(v => v.status === 'active').length,
        redeemed: vouchers.filter(v => v.status === 'redeemed').length,
        expired: vouchers.filter(v => v.status === 'expired').length,
    };

    const handleRedeem = async (code) => {
        setRedeeming(code);
        setFlash(null);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.content;
            const res = await fetch('/vouchers/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token, Accept: 'application/json' },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (res.ok) {
                setFlash({ type: 'success', message: data.message });
                // Update local state
                const idx = vouchers.findIndex(v => v.code === code);
                if (idx !== -1) {
                    vouchers[idx].status = 'redeemed';
                    vouchers[idx].status_label = 'Verbruikt';
                    vouchers[idx].redeemed_at = new Date().toLocaleDateString('nl-BE') + ' ' + new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
                }
            } else {
                setFlash({ type: 'error', message: data.error || 'Er ging iets mis.' });
            }
        } catch {
            setFlash({ type: 'error', message: 'Netwerkfout.' });
        }
        setRedeeming(null);
    };

    const filters = [
        { key: 'all', label: 'Alle' },
        { key: 'active', label: 'Actief' },
        { key: 'redeemed', label: 'Verbruikt' },
        { key: 'expired', label: 'Verlopen' },
    ];

    return (
        <>
            {flash && (
                <div className={`mx-3 sm:mx-6 mt-4 rounded-md border ring-1 p-3 ${flash.type === 'success' ? 'bg-emerald-900/30 ring-emerald-700/30' : 'bg-red-900/30 ring-red-700/30'}`}>
                    <p className={`text-sm ${flash.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{flash.message}</p>
                </div>
            )}

            <div className="px-3 sm:px-6 py-3 border-b border-slate-700">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex gap-2">
                        {filters.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f.key ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                {f.label} ({counts[f.key]})
                            </button>
                        ))}
                    </div>
                    <Link
                        href="/vouchers/activate"
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        Voucher scannen
                    </Link>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="px-3 sm:px-6 py-8 text-center text-slate-500">
                    Geen vouchers gevonden.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-700 text-left">
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Code</th>
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Lid</th>
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Status</th>
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Geldig tot</th>
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Verbruikt op</th>
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Verbruikt door</th>
                                <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Acties</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filtered.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-800/30">
                                    <td className="px-3 sm:px-6 py-3 font-mono text-sm text-white">{v.code}</td>
                                    <td className="px-3 sm:px-6 py-3 text-sm text-white">{v.member_name}</td>
                                    <td className="px-3 sm:px-6 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[v.status] || 'bg-slate-700 text-slate-300'}`}>
                                            {statusLabels[v.status] || v.status}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 text-xs text-slate-400">
                                        {v.expires_at ? new Date(v.expires_at).toLocaleDateString('nl-BE') : '-'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 text-xs text-slate-400">{v.redeemed_at || '-'}</td>
                                    <td className="px-3 sm:px-6 py-3 text-xs text-slate-400">{v.redeemed_by_name || '-'}</td>
                                    <td className="px-3 sm:px-6 py-3">
                                        {v.status === 'active' && (
                                            <button
                                                onClick={() => handleRedeem(v.code)}
                                                disabled={redeeming === v.code}
                                                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                                            >
                                                {redeeming === v.code ? 'Bezig...' : 'Activeer'}
                                            </button>
                                        )}
                                        {v.status === 'redeemed' && (
                                            <span className="text-xs text-slate-500">✓ Verbruikt</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
