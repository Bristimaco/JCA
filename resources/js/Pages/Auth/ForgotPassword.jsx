import { Head, useForm, Link, usePage } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function ForgotPassword() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post('/wachtwoord-vergeten');
    }

    return (
        <GuestLayout>
            <Head title="Wachtwoord vergeten" />
            <h2 className="text-xl font-bold text-stone-100 mb-1">Wachtwoord vergeten</h2>
            <p className="text-sm text-slate-400 mb-6">Vul uw e-mailadres in om een resetlink te ontvangen</p>

            {flash.status && (
                <div className="mb-4 rounded-lg bg-emerald-900/30 ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                        E-mailadres
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-slate-800"
                        placeholder="naam@voorbeeld.be"
                        required
                        autoFocus
                    />
                    {errors.email && <p className="mt-1.5 text-sm text-rose-400">{errors.email}</p>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-lg py-2.5 text-sm font-semibold hover:from-rose-700 hover:to-red-800 disabled:opacity-50 shadow-sm shadow-rose-900/30"
                >
                    Resetlink versturen
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
                <Link href="/login" className="font-medium text-rose-400 hover:text-rose-300">
                    Terug naar inloggen
                </Link>
            </p>
        </GuestLayout>
    );
}
