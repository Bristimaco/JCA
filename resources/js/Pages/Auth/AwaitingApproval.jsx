import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function AwaitingApproval() {
    const { post } = useForm({});

    return (
        <GuestLayout>
            <Head title="Wachten op goedkeuring" />
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">Wachten op goedkeuring</h2>

                <p className="text-sm text-gray-600 mb-6">
                    Je e-mailadres is geverifieerd. Een beheerder moet je account nog goedkeuren
                    en een rol toekennen voordat je de applicatie kan gebruiken.
                </p>

                <button
                    onClick={() => post('/logout')}
                    className="text-sm text-gray-600 hover:underline"
                >
                    Uitloggen
                </button>
            </div>
        </GuestLayout>
    );
}
