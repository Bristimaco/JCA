import { useForm } from '@inertiajs/react';

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
    if (!invoices || invoices.length === 0) {
        return (
            <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700">
                <div className="px-6 py-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-white">Facturen</h2>
                </div>
                <div className="px-6 py-8 text-center text-slate-500">
                    Geen facturen gevonden.
                </div>
            </div>
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
        <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700">
            <div className="px-6 py-4 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-white">
                    Facturen
                    <span className="ml-2 inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                        {summary.total}
                    </span>
                </h2>
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
                            <th className="px-6 py-3 text-xs font-medium text-slate-400">Gebruiker</th>
                            <th className="px-6 py-3 text-xs font-medium text-slate-400">Leden</th>
                            <th className="px-6 py-3 text-xs font-medium text-slate-400">Bedrag</th>
                            <th className="px-6 py-3 text-xs font-medium text-slate-400">Status</th>
                            <th className="px-6 py-3 text-xs font-medium text-slate-400">Vervaldatum</th>
                            <th className="px-6 py-3 text-xs font-medium text-slate-400">Betaald</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {invoices.map((inv) => (
                            <InvoiceRow key={inv.id} invoice={inv} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function InvoiceRow({ invoice }) {
    return (
        <tr className="hover:bg-slate-800/30">
            <td className="px-6 py-3">
                <p className="text-sm font-medium text-white">{invoice.user_name}</p>
                <p className="text-xs text-slate-500">{invoice.user_email}</p>
            </td>
            <td className="px-6 py-3">
                <div className="flex flex-wrap gap-1">
                    {invoice.members.map((m, i) => (
                        <span key={i} className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                            {m}
                        </span>
                    ))}
                </div>
            </td>
            <td className="px-6 py-3 text-sm font-medium text-emerald-400">
                €{Number(invoice.total_amount).toFixed(2)}
            </td>
            <td className="px-6 py-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[invoice.status] || 'bg-slate-700 text-slate-300'}`}>
                    {statusLabels[invoice.status] || invoice.status}
                </span>
            </td>
            <td className="px-6 py-3 text-xs text-slate-400">
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('nl-BE') : '-'}
            </td>
            <td className="px-6 py-3 text-xs text-slate-400">
                {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString('nl-BE') : '-'}
            </td>
        </tr>
    );
}
