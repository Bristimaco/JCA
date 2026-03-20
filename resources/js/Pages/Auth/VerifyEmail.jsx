import { Head, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function VerifyEmail() {
    const { flash } = usePage().props;
    const resendForm = useForm({});
    const logoutForm = useForm({});

    function handleResend(e) {
        e.preventDefault();
        resendForm.post('/email/verification-notification');
    }

    function handleLogout(e) {
        e.preventDefault();
        logoutForm.post('/logout');
    }

    return (
        <GuestLayout>
            <Head title="E-mail verifiëren" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">E-mail verifiëren</h2>

            <p className="text-sm text-gray-600 mb-4">
                Bedankt voor je registratie! Controleer je inbox en klik op de verificatielink
                om je e-mailadres te bevestigen.
            </p>

            {flash?.status === 'verification-link-sent' && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                    Er is een nieuwe verificatielink naar je e-mailadres verstuurd.
                </div>
            )}

            <form onSubmit={handleResend}>
                <button
                    type="submit"
                    disabled={resendForm.processing}
                    className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    Verificatiemail opnieuw versturen
                </button>
            </form>

            <div className="mt-4 text-center">
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:underline"
                >
                    Uitloggen
                </button>
            </div>
        </GuestLayout>
    );
}
