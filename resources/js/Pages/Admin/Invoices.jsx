import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import InvoicesSection from '../Dashboard/InvoicesSection';

export default function Invoices({ invoices }) {
    return (
        <AppLayout>
            <Head title="Facturen" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Facturen</h1>
                <p className="text-sm text-slate-400 mt-1">Beheer lidmaatschapsfacturen en betalingen</p>
            </div>
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                <InvoicesSection invoices={invoices} />
            </div>
        </AppLayout>
    );
}
