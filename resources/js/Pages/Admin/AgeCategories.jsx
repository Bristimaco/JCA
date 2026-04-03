import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import AgeCategoriesSection from '../Dashboard/AgeCategoriesSection';

export default function AgeCategories({ ageCategories }) {
    return (
        <AppLayout>
            <Head title="Leeftijdscategorieën" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Leeftijdscategorieën</h1>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                    ← Dashboard
                </Link>
            </div>

            <div className="rounded-xl bg-slate-800/40 ring-1 ring-slate-700/50 overflow-hidden">
                <AgeCategoriesSection ageCategories={ageCategories} />
            </div>
        </AppLayout>
    );
}
