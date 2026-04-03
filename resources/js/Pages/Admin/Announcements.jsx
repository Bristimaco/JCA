import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import AnnouncementsSection from '../Dashboard/AnnouncementsSection';

export default function Announcements({ announcements }) {
    return (
        <AppLayout>
            <Head title="Mededelingen" />
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Mededelingen</h1>
                    <p className="text-sm text-slate-400 mt-1">Beheer clubmededelingen en aankondigingen</p>
                </div>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                    ← Dashboard
                </Link>
            </div>
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                <AnnouncementsSection announcements={announcements || []} />
            </div>
        </AppLayout>
    );
}
