import { Head, useForm, Link } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post('/register');
    }

    return (
        <GuestLayout>
            <Head title="Registreren" />
            <h2 className="text-xl font-bold text-stone-100 mb-1">Account aanmaken</h2>
            <p className="text-sm text-slate-400 mb-6">Word lid van de dojo</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                        Naam
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-slate-800"
                        placeholder="Volledige naam"
                        required
                        autoFocus
                    />
                    {errors.name && <p className="mt-1.5 text-sm text-rose-400">{errors.name}</p>}
                </div>

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
                    Registreren
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
                Heb je al een account?{' '}
                <Link href="/login" className="font-medium text-rose-400 hover:text-rose-300">
                    Inloggen
                </Link>
            </p>
        </GuestLayout>
    );
}
