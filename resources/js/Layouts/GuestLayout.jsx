import { usePage } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const { club } = usePage().props;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-indigo-50 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    {club?.has_logo && (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/50 mb-4">
                            <img src="/club-logo" alt="" className="h-14 w-14 object-contain" />
                        </div>
                    )}
                    {!club?.has_logo && (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4">
                            <span className="text-2xl font-bold text-white">JCA</span>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{club?.name || 'JCA'}</h1>
                </div>
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/50 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
