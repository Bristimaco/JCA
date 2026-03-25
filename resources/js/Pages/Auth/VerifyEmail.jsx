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
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
                    <svg className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">E-mail verifiëren</h2>
            </div>

            <p className="text-sm text-slate-500 mb-4 text-center">
                Controleer je inbox en klik op de verificatielink
                om je e-mailadres te bevestigen.
            </p>

            {flash?.status === 'verification-link-sent' && (
                <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-200/50">
                    Er is een nieuwe verificatielink naar je e-mailadres verstuurd.
                </div>
            )}

            <form onSubmit={handleResend}>
                <button
                    type="submit"
                    disabled={resendForm.processing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg py-2.5 text-sm font-semibold hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 shadow-sm shadow-indigo-200"
                >
                    Verificatiemail opnieuw versturen
                </button>
            </form>

            <div className="mt-4 text-center">
                <button
                    onClick={handleLogout}
                    className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                >
                    Uitloggen
                </button>
            </div>
        </GuestLayout>
    );
}
