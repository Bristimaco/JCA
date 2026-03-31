import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post('/wachtwoord-reset');
    }

    return (
        <GuestLayout>
            <Head title="Wachtwoord resetten" />
            <h2 className="text-xl font-bold text-stone-100 mb-1">Nieuw wachtwoord instellen</h2>
            <p className="text-sm text-slate-400 mb-6">Kies een nieuw wachtwoord voor uw account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                        E-mailadres
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-slate-800 opacity-60"
                        readOnly
                    />
                    {errors.email && <p className="mt-1.5 text-sm text-rose-400">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                        Nieuw wachtwoord
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-slate-800"
                        required
                        autoFocus
                    />
                    {errors.password && <p className="mt-1.5 text-sm text-rose-400">{errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-300 mb-1">
                        Wachtwoord bevestigen
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={e => setData('password_confirmation', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-slate-800"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-lg py-2.5 text-sm font-semibold hover:from-rose-700 hover:to-red-800 disabled:opacity-50 shadow-sm shadow-rose-900/30"
                >
                    Wachtwoord opslaan
                </button>
            </form>
        </GuestLayout>
    );
}
