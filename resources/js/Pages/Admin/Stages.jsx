import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import StagesSection from './StagesSection';

export default function Stages({ stages, ageCategories, competitionMembers, statuses, availableCoaches, userRole }) {
    return (
        <AppLayout>
            <Head title="Stages" />

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-white">Stages</h1>
                </div>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                    ← Dashboard
                </Link>
            </div>

            <StagesSection stages={stages} ageCategories={ageCategories} competitionMembers={competitionMembers} statuses={statuses} availableCoaches={availableCoaches} userRole={userRole} />
        </AppLayout>
    );
}
