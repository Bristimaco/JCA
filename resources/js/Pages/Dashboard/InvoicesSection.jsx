import { useForm, usePage } from '@inertiajs/react';

const statusColors = {
    pending: 'bg-amber-900/30 text-amber-400',
    paid: 'bg-emerald-900/30 text-emerald-400',
    expired: 'bg-red-900/30 text-red-400',
    failed: 'bg-red-900/30 text-red-400',
};

const statusLabels = {
    pending: 'In afwachting',
    paid: 'Betaald',
    expired: 'Verlopen',
    failed: 'Mislukt',
};

export default function InvoicesSection({ invoices }) {
    const { flash } = usePage().props;
    const generateForm = useForm({});

    const handleGenerate = () => {
        generateForm.post('/admin/invoices/generate', { preserveScroll: true });
    };

    if (!invoices || invoices.length === 0) {
        return (
            <>
                {flash.status && (
                    <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 border ring-1 ring-emerald-700/30 p-3">
                        <p className="text-sm text-emerald-400">{flash.status}</p>
                    </div>
                )}
                <div className="px-3 sm:px-6 py-3 flex items-center justify-end border-b border-slate-700">
                    <button
                        onClick={handleGenerate}
                        disabled={generateForm.processing}
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                        {generateForm.processing ? 'Bezig...' : 'Facturen genereren'}
                    </button>
                </div>
                <div className="px-3 sm:px-6 py-8 text-center text-slate-500">
                    Geen facturen gevonden.
                </div>
            </>
        );
    }

    const summary = {
        total: invoices.length,
        pending: invoices.filter(i => i.status === 'pending').length,
        paid: invoices.filter(i => i.status === 'paid').length,
        totalAmount: invoices.reduce((sum, i) => sum + Number(i.total_amount), 0),
        paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total_amount), 0),
    };

    return (
        <>
            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 border ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}
            <div className="px-3 sm:px-6 py-3 border-b border-slate-700">
                <div className="flex items-center justify-end">
                    <button
                        onClick={handleGenerate}
                        disabled={generateForm.processing}
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                        {generateForm.processing ? 'Bezig...' : 'Facturen genereren'}
                    </button>
                </div>
                <div className="flex gap-4 mt-2">
                    <span className="text-xs text-amber-400">{summary.pending} openstaand</span>
                    <span className="text-xs text-emerald-400">{summary.paid} betaald</span>
                    <span className="text-xs text-slate-400">
                        €{summary.paidAmount.toFixed(2)} / €{summary.totalAmount.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-700 text-left">
                            <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Gebruiker</th>
                            <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Leden</th>
                            <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Bedrag</th>
                            <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Status</th>
                            <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Vervaldatum</th>
                            <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Betaald</th>
                            <th className="px-3 sm:px-6 py-3 text-xs font-medium text-slate-400">Acties</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {invoices.map((inv) => (
                            <InvoiceRow key={inv.id} invoice={inv} />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function InvoiceRow({ invoice }) {
    const retryForm = useForm({});
    const checkStatusForm = useForm({});

    const handleRetry = () => {
        retryForm.post(`/admin/invoices/${invoice.id}/retry-payment`, { preserveScroll: true });
    };

    const handleCheckStatus = () => {
        checkStatusForm.post(`/admin/invoices/${invoice.id}/check-status`, { preserveScroll: true });
    };

    return (
        <tr className="hover:bg-slate-800/30">
            <td className="px-3 sm:px-6 py-3">
                <p className="text-sm font-medium text-white">{invoice.user_name}</p>
                <p className="text-xs text-slate-500">{invoice.user_email}</p>
            </td>
            <td className="px-3 sm:px-6 py-3">
                <div className="flex flex-wrap gap-1">
                    {invoice.members.map((m, i) => (
                        <span key={i} className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                            {m}
                        </span>
                    ))}
                </div>
            </td>
            <td className="px-3 sm:px-6 py-3 text-sm font-medium text-emerald-400">
                €{Number(invoice.total_amount).toFixed(2)}
            </td>
            <td className="px-3 sm:px-6 py-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[invoice.status] || 'bg-slate-700 text-slate-300'}`}>
                    {statusLabels[invoice.status] || invoice.status}
                </span>
            </td>
            <td className="px-3 sm:px-6 py-3 text-xs text-slate-400">
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('nl-BE') : '-'}
            </td>
            <td className="px-3 sm:px-6 py-3 text-xs text-slate-400">
                {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('nl-BE') : '-'}
            </td>
            <td className="px-3 sm:px-6 py-3">
                {invoice.status === 'pending' && !invoice.has_payment_url && (
                    <button
                        onClick={handleRetry}
                        disabled={retryForm.processing}
                        className="text-xs font-medium text-rose-400 hover:text-rose-300 disabled:opacity-50"
                    >
                        {retryForm.processing ? 'Bezig...' : 'Betaallink aanmaken'}
                    </button>
                )}
                {invoice.status === 'pending' && invoice.has_payment_url && (
                    <button
                        onClick={handleCheckStatus}
                        disabled={checkStatusForm.processing}
                        className="text-xs font-medium text-sky-400 hover:text-sky-300 disabled:opacity-50"
                    >
                        {checkStatusForm.processing ? 'Bezig...' : 'Status controleren'}
                    </button>
                )}
                {invoice.status === 'paid' && (
                    <span className="text-xs text-emerald-500">✓ Betaald</span>
                )}
            </td>
        </tr>
    );
}
