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
            <h2 className="text-xl font-bold text-slate-900 mb-1">Inloggen</h2>
            <p className="text-sm text-slate-500 mb-6">Welkom terug bij je club</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                        E-mailadres
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                        placeholder="naam@voorbeeld.be"
                        required
                        autoFocus
                    />
                    {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                        Wachtwoord
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={e => setData('password', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
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
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-slate-600">
                        Onthoud mij
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg py-2.5 text-sm font-semibold hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 shadow-sm shadow-indigo-200"
                >
                    Inloggen
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Nog geen account?{' '}
                <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-800">
                    Registreren
                </Link>
            </p>
        </GuestLayout>
    );
}
