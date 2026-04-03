import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import AgeCategoriesSection from '../Dashboard/AgeCategoriesSection';

export default function AgeCategories({ ageCategories }) {
    return (
        <AppLayout>
            <Head title="Leeftijdscategorieën" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white">Leeftijdscategorieën</h1>
            </div>

            <div className="rounded-xl bg-slate-800/40 ring-1 ring-slate-700/50 overflow-hidden">
                <AgeCategoriesSection ageCategories={ageCategories} />
            </div>
        </AppLayout>
    );
}
