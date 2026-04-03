import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import ClubSettingsSection from '../Dashboard/ClubSettingsSection';

export default function ClubSettings({ clubSettings }) {
    return (
        <AppLayout>
            <Head title="Club Instellingen" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white">Club Instellingen</h1>
            </div>

            <div className="rounded-xl bg-slate-800/40 ring-1 ring-slate-700/50 overflow-hidden">
                <ClubSettingsSection clubSettings={clubSettings} />
            </div>
        </AppLayout>
    );
}
