import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import BarProductsSection from '../Dashboard/BarProductsSection';

export default function BarProducts({ products }) {
    return (
        <AppLayout>
            <Head title="Kassa Producten" />

            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">Kassa Producten</h1>

                <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 overflow-hidden">
                    <BarProductsSection products={products} />
                </div>
            </div>
        </AppLayout>
    );
}
