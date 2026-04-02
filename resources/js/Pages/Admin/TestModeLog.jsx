import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

const typeLabels = {
    notification: 'Notificatie',
    mail: 'E-mail',
    mollie_payment: 'Betaallink',
};

const typeBadgeColors = {
    notification: 'bg-blue-900/40 text-blue-400',
    mail: 'bg-purple-900/40 text-purple-400',
    mollie_payment: 'bg-emerald-900/40 text-emerald-400',
};

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('nl-BE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function TestModeLog({ logs }) {
    const handleClear = () => {
        if (confirm('Weet je zeker dat je de volledige test mode log wilt wissen?')) {
            router.delete('/admin/test-mode-log');
        }
    };

    return (
        <AppLayout>
            <Head title="Test Mode Log" />

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
                        &larr; Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Test Mode Log</h1>
                </div>
                {logs.data.length > 0 && (
                    <button
                        onClick={handleClear}
                        className="rounded-md bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 ring-1 ring-red-600/30 hover:bg-red-600/30"
                    >
                        Log wissen
                    </button>
                )}
            </div>

            <p className="text-sm text-slate-400 mb-4">
                Overzicht van notificaties, e-mails en betaallinks die geblokkeerd zijn door de test modus.
            </p>

            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                {logs.data.length === 0 ? (
                    <p className="p-6 text-slate-500 text-sm text-center">Nog geen geblokkeerde acties.</p>
                ) : (
                    <>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-left text-slate-400">
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Ontvanger</th>
                                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Onderwerp</th>
                                    <th className="px-4 py-3 font-medium text-right">Tijdstip</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-800/30">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeColors[log.type] || 'bg-slate-700 text-slate-300'}`}>
                                                {typeLabels[log.type] || log.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-white">{log.recipient}</td>
                                        <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{log.subject}</td>
                                        <td className="px-4 py-3 text-right text-slate-400">{formatDate(log.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {logs.links && logs.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1 p-4 border-t border-slate-800">
                                {logs.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                            link.active
                                                ? 'bg-rose-700 text-white'
                                                : link.url
                                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                                    : 'text-slate-600 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
