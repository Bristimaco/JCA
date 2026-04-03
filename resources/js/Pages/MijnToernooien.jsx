import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import MyTournamentsSection from './Dashboard/MyTournamentsSection';

export default function MijnToernooien({ tournaments }) {
    return (
        <AppLayout>
            <Head title="Mijn Toernooien" />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white">Mijn Toernooien</h1>
            </div>

            {tournaments.length === 0 ? (
                <p className="text-sm text-slate-500">Je hebt nog geen toernooiuitnodigingen.</p>
            ) : (
                <MyTournamentsSection tournaments={tournaments} />
            )}
        </AppLayout>
    );
}
