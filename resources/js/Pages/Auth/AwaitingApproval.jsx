import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function AwaitingApproval() {
    const { post } = useForm({});

    return (
        <GuestLayout>
            <Head title="Wachten op goedkeuring" />
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-900/30">
                    <svg className="h-7 w-7 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h2 className="text-xl font-bold text-stone-100 mb-2">Wachten op goedkeuring</h2>

                <p className="text-sm text-slate-400 mb-6">
                    Je e-mailadres is geverifieerd. Een beheerder moet je account nog goedkeuren
                    en een rol toekennen voordat je de applicatie kan gebruiken.
                </p>

                <button
                    onClick={() => post('/logout')}
                    className="text-sm text-slate-400 hover:text-slate-200 font-medium"
                >
                    Uitloggen
                </button>
            </div>
        </GuestLayout>
    );
}
