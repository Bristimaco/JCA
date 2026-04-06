import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AppLayout from '../../Layouts/AppLayout';

const TABS = [
    { key: 'account', label: 'Per Rekening' },
    { key: 'counterparty', label: 'Per Tegenpartij' },
];

const PERIODS = [
    { key: 'this_month', label: 'Deze maand' },
    { key: 'last_month', label: 'Vorige maand' },
    { key: 'quarter', label: 'Dit kwartaal' },
    { key: 'year', label: 'Dit jaar' },
    { key: 'all', label: 'Alles' },
    { key: 'custom', label: 'Aangepast' },
];

function formatCurrency(val) {
    return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(val);
}

function formatMonth(m) {
    const [y, mo] = m.split('-');
    const names = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    return `${names[parseInt(mo) - 1]} ${y}`;
}

export default function BankReport({ rows, months, chartData, totals, accounts, dimensions, tab, period, dimensionIndex, from, to }) {
    const [customFrom, setCustomFrom] = useState(from || '');
    const [customTo, setCustomTo] = useState(to || '');

    const dimensionTabs = dimensions
        .map((d, i) => d ? { key: 'dimension', label: `Per ${d.name}`, index: i + 1 } : null)
        .filter(Boolean);

    const allTabs = [...TABS, ...dimensionTabs];

    const navigate = (params) => {
        router.get('/admin/financieel-rapport', {
            tab,
            period,
            dimension_index: dimensionIndex,
            from: customFrom,
            to: customTo,
            ...params,
        }, { preserveState: true });
    };

    const handleTabChange = (t, idx) => {
        navigate({ tab: t, dimension_index: idx || dimensionIndex });
    };

    const handlePeriodChange = (p) => {
        if (p === 'custom') {
            navigate({ period: p });
        } else {
            navigate({ period: p, from: '', to: '' });
        }
    };

    const handleCustomApply = () => {
        navigate({ period: 'custom' });
    };

    const exportUrl = `/admin/financieel-rapport/export?tab=${tab}&period=${period}&dimension_index=${dimensionIndex}&from=${customFrom}&to=${customTo}`;

    return (
        <AppLayout>
            <Head title="Financieel Rapport" />

            <div className="mb-6 flex items-center gap-3">
                <Link href="/admin/bankbewegingen" className="text-slate-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </Link>
                <h1 className="text-2xl font-bold text-white">Financieel Rapport</h1>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {allTabs.map((t) => (
                    <button
                        key={t.key + (t.index || '')}
                        onClick={() => handleTabChange(t.key, t.index)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            tab === t.key && (!t.index || dimensionIndex === t.index)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Period + Export */}
            <div className="flex flex-wrap items-end gap-3 mb-6">
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Periode</label>
                    <select
                        value={period}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        className="rounded-lg bg-slate-800 text-white border-slate-700 text-sm px-3 py-2"
                    >
                        {PERIODS.map((p) => (
                            <option key={p.key} value={p.key}>{p.label}</option>
                        ))}
                    </select>
                </div>
                {period === 'custom' && (
                    <>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Van</label>
                            <input
                                type="date"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                className="rounded-lg bg-slate-800 text-white border-slate-700 text-sm px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Tot</label>
                            <input
                                type="date"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                className="rounded-lg bg-slate-800 text-white border-slate-700 text-sm px-3 py-2"
                            />
                        </div>
                        <button
                            onClick={handleCustomApply}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500"
                        >
                            Toepassen
                        </button>
                    </>
                )}
                <div className="ml-auto">
                    <a
                        href={exportUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Excel
                    </a>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-5">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Inkomsten</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(totals.income)}</p>
                </div>
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-5">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Uitgaven</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(totals.expense)}</p>
                </div>
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-5">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Saldo</p>
                    <p className={`text-2xl font-bold mt-1 ${totals.total >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(totals.total)}</p>
                </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-5 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Inkomsten vs. Uitgaven per maand</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                                labelStyle={{ color: '#e2e8f0' }}
                                formatter={(value) => formatCurrency(value)}
                                labelFormatter={formatMonth}
                            />
                            <Legend />
                            <Bar dataKey="income" name="Inkomsten" fill="#34d399" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Uitgaven" fill="#f87171" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="px-4 py-3 text-slate-400 font-medium sticky left-0 bg-slate-900 z-10 min-w-[180px]">
                                    {tab === 'account' ? 'Rekening' : tab === 'counterparty' ? 'Tegenpartij' : 'Dimensie'}
                                </th>
                                {months.map((m) => (
                                    <th key={m} className="px-3 py-3 text-slate-400 font-medium text-right whitespace-nowrap">{formatMonth(m)}</th>
                                ))}
                                <th className="px-3 py-3 text-slate-400 font-medium text-right">Totaal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {rows.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-800/50">
                                    <td className="px-4 py-3 text-white font-medium sticky left-0 bg-slate-900 z-10 truncate max-w-[220px]" title={row.label}>
                                        {row.label}
                                    </td>
                                    {months.map((m) => {
                                        const val = row.months[m]?.total ?? 0;
                                        return (
                                            <td key={m} className={`px-3 py-3 text-right whitespace-nowrap ${val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {formatCurrency(val)}
                                            </td>
                                        );
                                    })}
                                    <td className={`px-3 py-3 text-right font-semibold whitespace-nowrap ${row.total >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatCurrency(row.total)}
                                    </td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={months.length + 2} className="px-4 py-12 text-center text-slate-500">
                                        Geen data gevonden voor de geselecteerde periode.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {rows.length > 0 && (
                            <tfoot>
                                <tr className="border-t-2 border-slate-700 bg-slate-800/50">
                                    <td className="px-4 py-3 text-white font-bold sticky left-0 bg-slate-800/50 z-10">Totaal</td>
                                    {months.map((m) => {
                                        const monthTotal = rows.reduce((s, r) => s + (r.months[m]?.total ?? 0), 0);
                                        return (
                                            <td key={m} className={`px-3 py-3 text-right font-bold whitespace-nowrap ${monthTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {formatCurrency(monthTotal)}
                                            </td>
                                        );
                                    })}
                                    <td className={`px-3 py-3 text-right font-bold whitespace-nowrap ${totals.total >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatCurrency(totals.total)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
