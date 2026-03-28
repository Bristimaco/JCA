import { Head, useForm } from '@inertiajs/react';

export default function Pin() {
    const form = useForm({ pin: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/attendance/verify');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Head title="Aanwezigheid - PIN" />

            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Aanwezigheid</h1>
                    <p className="text-slate-400 mt-1">Voer de PIN-code in om door te gaan</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="off"
                            value={form.data.pin}
                            onChange={(e) => form.setData('pin', e.target.value)}
                            placeholder="PIN-code"
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 text-white text-center text-3xl tracking-[0.5em] py-4 shadow-sm focus:border-rose-500 focus:ring-rose-500 placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal"
                            autoFocus
                        />
                        {form.errors.pin && (
                            <p className="text-sm text-red-400 mt-2 text-center">{form.errors.pin}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing || !form.data.pin}
                        className="w-full rounded-xl bg-rose-600 px-4 py-4 text-lg font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
                    >
                        Doorgaan
                    </button>
                </form>
            </div>
        </div>
    );
}
