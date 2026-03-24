import { usePage } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const { club } = usePage().props;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    {club?.has_logo && (
                        <img src="/club-logo" alt="" className="h-16 w-16 object-contain mx-auto mb-3" />
                    )}
                    <h1 className="text-3xl font-bold text-gray-900">{club?.name || 'JCA'}</h1>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
