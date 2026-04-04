import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function BankTransactions({ transactions, accounts, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [account, setAccount] = useState(filters.account || '');
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');

    const importForm = useForm({ file: null });

    const applyFilters = () => {
        router.get('/admin/bankbewegingen', {
            ...(search && { search }),
            ...(account && { account }),
            ...(from && { from }),
            ...(to && { to }),
        }, { preserveState: true, preserveScroll: true });
    };

    const resetFilters = () => {
        setSearch('');
        setAccount('');
        setFrom('');
        setTo('');
        router.get('/admin/bankbewegingen', {}, { preserveState: true });
    };

    const handleImport = (e) => {
        e.preventDefault();
        if (!importForm.data.file) return;
        importForm.post('/admin/bankbewegingen/import', {
            preserveScroll: true,
            onSuccess: () => importForm.reset('file'),
        });
    };

    const formatAmount = (amount) => {
        const n = Number(amount);
        const formatted = Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return n >= 0 ? `+€${formatted}` : `-€${formatted}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const hasActiveFilters = search || account || from || to;

    return (
        <AppLayout>
            <Head title="Financieel Beheer" />

            <div className="mb-6 flex items-center gap-3">
                <Link href="/" className="text-slate-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </Link>
                <h1 className="text-2xl font-bold text-white">Financieel Beheer</h1>
            </div>

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

            {/* Import */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-3">CODA Bestand Importeren</h2>
                <form onSubmit={handleImport} className="flex items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Selecteer een .cod bestand</label>
                        <input
                            type="file"
                            accept=".cod,.coda"
                            onChange={(e) => importForm.setData('file', e.target.files[0])}
                            className="w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700 file:ring-1 file:ring-slate-700"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={importForm.processing || !importForm.data.file}
                        className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Importeren
                    </button>
                </form>
            </div>

            {/* Filters */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Zoeken</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            placeholder="Naam, rekening, mededeling..."
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder-slate-500"
                        />
                    </div>
                    {accounts.length > 1 && (
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Rekening</label>
                            <select
                                value={account}
                                onChange={(e) => setAccount(e.target.value)}
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            >
                                <option value="">Alle rekeningen</option>
                                {accounts.map((a) => (
                                    <option key={a.number} value={a.number}>{a.name || a.number}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Van</label>
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Tot</label>
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={applyFilters}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                    >
                        Filteren
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700"
                        >
                            Filters wissen
                        </button>
                    )}
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Transacties</h2>
                    <span className="text-sm text-slate-400">{transactions.length} resultaten</span>
                </div>

                {transactions.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500">
                        {hasActiveFilters ? 'Geen transacties gevonden voor deze filters.' : 'Nog geen transacties geïmporteerd. Upload een CODA bestand om te beginnen.'}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-3">Datum</th>
                                        <th className="px-6 py-3">Tegenpartij</th>
                                        <th className="px-6 py-3">Rekening</th>
                                        <th className="px-6 py-3 text-right">Bedrag</th>
                                        <th className="px-6 py-3">Mededeling</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-800/50">
                                            <td className="px-6 py-3 text-slate-300 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                                            <td className="px-6 py-3 text-white font-medium">{t.counterparty_name || '-'}</td>
                                            <td className="px-6 py-3 text-slate-400 font-mono text-xs">{t.counterparty_account || '-'}</td>
                                            <td className={`px-6 py-3 text-right font-semibold whitespace-nowrap ${t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {formatAmount(t.amount)}
                                            </td>
                                            <td className="px-6 py-3 text-slate-400 max-w-xs truncate">
                                                {t.structured_message || t.message || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="lg:hidden divide-y divide-slate-800">
                            {transactions.map((t) => (
                                <div key={t.id} className="px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-white truncate">{t.counterparty_name || '-'}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(t.transaction_date)}</p>
                                            {(t.structured_message || t.message) && (
                                                <p className="text-xs text-slate-400 mt-1 truncate">{t.structured_message || t.message}</p>
                                            )}
                                        </div>
                                        <span className={`text-sm font-semibold whitespace-nowrap ${t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {formatAmount(t.amount)}
                                        </span>
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
