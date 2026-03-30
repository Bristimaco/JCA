import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import SponsorsSection from '../Dashboard/SponsorsSection';

export default function Sponsors({ sponsors }) {
    return (
        <AppLayout>
            <Head title="Sponsors" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Sponsors</h1>
                <p className="text-sm text-slate-400 mt-1">Beheer sponsors en contracten</p>
            </div>
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                <SponsorsSection sponsors={sponsors || []} />
            </div>
        </AppLayout>
    );
}
