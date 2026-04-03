import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import RefillProductsSection from '../Dashboard/RefillProductsSection';

export default function RefillProducts({ refillProducts }) {
    return (
        <AppLayout>
            <Head title="Aan te vullen" />
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Aan te vullen producten</h1>
                    <p className="text-sm text-slate-400 mt-1">Producten die aangevuld moeten worden</p>
                </div>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                    ← Dashboard
                </Link>
            </div>
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                <RefillProductsSection products={refillProducts || []} />
            </div>
        </AppLayout>
    );
}
