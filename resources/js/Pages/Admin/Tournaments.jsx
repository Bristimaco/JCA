import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import TournamentsSection from './TournamentsSection';

export default function Tournaments({ tournaments, ageCategories, competitionMembers, statuses, availableCoaches }) {
    return (
        <AppLayout>
            <Head title="Toernooien" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Toernooien</h1>
                <Link href="/archief" className="text-sm text-purple-600 hover:text-purple-800">
                    Archief →
                </Link>
            </div>

            <TournamentsSection tournaments={tournaments} ageCategories={ageCategories} competitionMembers={competitionMembers} statuses={statuses} availableCoaches={availableCoaches} />
        </AppLayout>
    );
}
