import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import MembersSection from '../Dashboard/MembersSection';

export default function Members({ members, ageCategories, weightCategories, beltRanks }) {
    return (
        <AppLayout>
            <Head title="Leden" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Ledenlijst</h1>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                    ← Dashboard
                </Link>
            </div>

            <MembersSection members={members} ageCategories={ageCategories} weightCategories={weightCategories} beltRanks={beltRanks} />
        </AppLayout>
    );
}
