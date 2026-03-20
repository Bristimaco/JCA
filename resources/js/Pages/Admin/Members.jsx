import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import MembersSection from '../Dashboard/MembersSection';

export default function Members({ members, ageCategories, weightCategories, beltRanks }) {
    return (
        <AppLayout>
            <Head title="Leden" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Ledenlijst</h1>
            </div>

            <MembersSection members={members} ageCategories={ageCategories} weightCategories={weightCategories} beltRanks={beltRanks} />
        </AppLayout>
    );
}
