import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import BarProductsSection from '../Dashboard/BarProductsSection';

export default function BarProducts({ products, categories }) {
    return (
        <AppLayout>
            <Head title="Kassa Producten" />

            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">Kassa Producten</h1>
                    <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                        ← Dashboard
                    </Link>
                </div>

                <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 overflow-hidden">
                    <BarProductsSection products={products} categories={categories} />
                </div>
            </div>
        </AppLayout>
    );
}
