import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import TournamentsSection from './TournamentsSection';

export default function Tournaments({ tournaments, ageCategories, competitionMembers, statuses }) {
    return (
        <AppLayout>
            <Head title="Toernooien" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Toernooien</h1>
            </div>

            <TournamentsSection tournaments={tournaments} ageCategories={ageCategories} competitionMembers={competitionMembers} statuses={statuses} />
        </AppLayout>
    );
}
