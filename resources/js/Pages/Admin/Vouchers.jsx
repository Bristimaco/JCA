import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import VouchersSection from '../Dashboard/VouchersSection';

export default function Vouchers({ vouchers }) {
    return (
        <AppLayout>
            <Head title="Vouchers" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Vouchers</h1>
                <p className="text-sm text-slate-400 mt-1">Beheer vouchers en activaties</p>
            </div>
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                <VouchersSection vouchers={vouchers || []} />
            </div>
        </AppLayout>
    );
}
