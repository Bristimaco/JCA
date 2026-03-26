import { usePage } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const { club } = usePage().props;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    {club?.has_logo && (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 shadow-lg ring-1 ring-slate-800/50 mb-4">
                            <img src="/club-logo" alt="" className="h-14 w-14 object-contain" />
                        </div>
                    )}
                    {!club?.has_logo && (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-600 to-red-800 shadow-lg mb-4">
                            <span className="text-2xl font-bold text-white">柔道</span>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-stone-100 tracking-tight">{club?.name || 'JCA'}</h1>
                    <p className="text-sm text-slate-400 mt-1">Judo Club Administratie</p>
                </div>
                <div className="bg-slate-900 rounded-2xl shadow-xl shadow-black/30 ring-1 ring-slate-800/50 border-t-2 border-t-rose-700 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
