import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import ActivitySection from '../Dashboard/ActivitySection';

export default function Activity({ activeSessions, inactiveUsers, loginLogs, inactiveDays }) {
    return (
        <AppLayout>
            <Head title="Activiteit" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Activiteit</h1>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                    ← Dashboard
                </Link>
            </div>

            <ActivitySection
                activeSessions={activeSessions}
                inactiveUsers={inactiveUsers}
                loginLogs={loginLogs}
                inactiveDays={inactiveDays}
            />
        </AppLayout>
    );
}
