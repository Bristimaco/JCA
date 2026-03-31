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
            <h2 className="text-xl font-bold text-stone-100 mb-1">Inloggen</h2>
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
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-slate-800"
                        placeholder="naam@voorbeeld.be"
                        required
                        autoFocus
                    />
                    {errors.email && <p className="mt-1.5 text-sm text-rose-400">{errors.email}</p>}
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
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-slate-800"
                        required
                    />
                    {errors.password && <p className="mt-1.5 text-sm text-rose-400">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={data.remember}
                            onChange={e => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-rose-500 focus:ring-rose-500"
                        />
                        <label htmlFor="remember" className="ml-2 text-sm text-slate-400">
                            Onthoud mij
                        </label>
                    </div>
                    <Link href="/wachtwoord-vergeten" className="text-sm text-rose-400 hover:text-rose-300">
                        Wachtwoord vergeten?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-lg py-2.5 text-sm font-semibold hover:from-rose-700 hover:to-red-800 disabled:opacity-50 shadow-sm shadow-rose-900/30"
                >
                    Inloggen
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
                Nog geen account?{' '}
                <Link href="/register" className="font-medium text-rose-400 hover:text-rose-300">
                    Registreren
                </Link>
            </p>

            <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
                <Link
                    href="/attendance"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Kiosk modus
                </Link>
            </div>
        </GuestLayout>
    );
}
