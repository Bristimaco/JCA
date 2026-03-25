import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function AwaitingApproval() {
    const { post } = useForm({});

    return (
        <GuestLayout>
            <Head title="Wachten op goedkeuring" />
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                    <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">Wachten op goedkeuring</h2>

                <p className="text-sm text-slate-500 mb-6">
                    Je e-mailadres is geverifieerd. Een beheerder moet je account nog goedkeuren
                    en een rol toekennen voordat je de applicatie kan gebruiken.
                </p>

                <button
                    onClick={() => post('/logout')}
                    className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                >
                    Uitloggen
                </button>
            </div>
        </GuestLayout>
    );
}
