import { Head, useForm, Link } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function handleSubmit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <GuestLayout>
            <Head title="Inloggen" />
            <h2 className="text-xl font-bold text-white mb-1">Inloggen</h2>
            <p className="text-sm text-slate-400 mb-6">Welkom terug op de tatami</p>

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
                        className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-slate-700"
                        placeholder="naam@voorbeeld.be"
                        required
                        autoFocus
                    />
                    {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                        Wachtwoord
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-slate-700"
                        required
                    />
                    {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div className="flex items-center">
                    <input
                        id="remember"
                        type="checkbox"
                        checked={data.remember}
                        onChange={e => setData('remember', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-slate-400">
                        Onthoud mij
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 shadow-sm shadow-amber-900/30"
                >
                    Inloggen
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
                Nog geen account?{' '}
                <Link href="/register" className="font-medium text-amber-400 hover:text-amber-300">
                    Registreren
                </Link>
            </p>
        </GuestLayout>
    );
}
