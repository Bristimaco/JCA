import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function BankTransactionImports({ imports }) {
    const { flash } = usePage().props;
    const [deleteFilename, setDeleteFilename] = useState(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <AppLayout>
            <Head title="Geïmporteerde Bestanden" />

            <div className="mb-6 flex items-center gap-3">
                <Link href="/admin/bankbewegingen" className="text-slate-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </Link>
                <h1 className="text-2xl font-bold text-white">Geïmporteerde Bestanden</h1>
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

            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">CODA Imports</h2>
                    <span className="text-sm text-slate-400">{imports.length} bestand{imports.length !== 1 ? 'en' : ''}</span>
                </div>

                {imports.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500">
                        Nog geen bestanden geïmporteerd.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {imports.map((imp) => (
                            <div key={imp.filename} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white truncate">{imp.filename}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {imp.count} transactie{imp.count !== 1 ? 's' : ''} — {formatDate(imp.min_date)}{imp.min_date !== imp.max_date ? ` t/m ${formatDate(imp.max_date)}` : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDeleteFilename(imp.filename)}
                                    className="ml-3 text-slate-400 hover:text-red-400"
                                    title="Import verwijderen"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete confirmation modal */}
            {deleteFilename && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setDeleteFilename(null)}>
                    <div className="bg-slate-900 rounded-xl ring-1 ring-slate-700 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-2">Import verwijderen?</h3>
                        <p className="text-sm text-slate-400 mb-1">
                            Alle transacties uit <span className="font-medium text-white">{deleteFilename}</span> worden permanent verwijderd.
                        </p>
                        <p className="text-xs text-slate-500 mb-5">Dit kan niet ongedaan gemaakt worden. U kunt het bestand nadien opnieuw importeren.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteFilename(null)}
                                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={() => {
                                    router.delete('/admin/bankbewegingen/import', {
                                        data: { filename: deleteFilename },
                                        preserveScroll: true,
                                        onSuccess: () => setDeleteFilename(null),
                                    });
                                }}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Verwijderen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
