import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

const periods = [
    { value: 'month', label: 'Afgelopen maand' },
    { value: 'half_year', label: 'Afgelopen 6 maanden' },
    { value: 'year', label: 'Afgelopen jaar' },
    { value: 'all', label: 'Alle tijden' },
];

export default function SalesStats({ rankings, period, totalOrders, totalRevenue }) {
    const changePeriod = (p) => {
        router.get('/admin/verkoop-statistieken', { period: p }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Verkoopstatistieken" />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">Verkoopstatistieken</h1>
                    <div className="flex items-center gap-3">
                        <select
                            value={period}
                            onChange={(e) => changePeriod(e.target.value)}
                            className="rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        >
                            {periods.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                        <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                            ← Dashboard
                        </Link>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-5">
                        <p className="text-sm text-slate-400">Totaal bestellingen</p>
                        <p className="text-3xl font-bold text-white mt-1">{totalOrders}</p>
                    </div>
                    <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-5">
                        <p className="text-sm text-slate-400">Totaal omzet</p>
                        <p className="text-3xl font-bold text-emerald-400 mt-1">€{Number(totalRevenue).toFixed(2)}</p>
                    </div>
                </div>

                {/* Rankings table */}
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                    {rankings.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                            Geen verkopen in deze periode.
                        </div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <table className="hidden lg:table w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700 text-left">
                                        <th className="px-6 py-3 text-xs font-medium text-slate-400 w-12">#</th>
                                        <th className="px-6 py-3 text-xs font-medium text-slate-400">Product</th>
                                        <th className="px-6 py-3 text-xs font-medium text-slate-400 text-right">Aantal verkocht</th>
                                        <th className="px-6 py-3 text-xs font-medium text-slate-400 text-right">Omzet</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {rankings.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-800/30">
                                            <td className="px-6 py-3 text-slate-500 font-medium">{i + 1}</td>
                                            <td className="px-6 py-3 font-medium text-white">{r.product_name}</td>
                                            <td className="px-6 py-3 text-right font-bold text-white tabular-nums">{r.total_quantity}</td>
                                            <td className="px-6 py-3 text-right font-medium text-emerald-400 tabular-nums">€{Number(r.total_revenue).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile cards */}
                            <div className="lg:hidden divide-y divide-slate-800">
                                {rankings.map((r, i) => (
                                    <div key={i} className="px-4 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-slate-500 font-medium w-6 shrink-0">{i + 1}</span>
                                            <span className="font-medium text-white truncate">{r.product_name}</span>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <p className="text-sm font-bold text-white tabular-nums">{r.total_quantity}x</p>
                                            <p className="text-xs font-medium text-emerald-400 tabular-nums">€{Number(r.total_revenue).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
