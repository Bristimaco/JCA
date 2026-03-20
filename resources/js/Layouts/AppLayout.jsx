import { Link, usePage, useForm } from '@inertiajs/react';

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const logoutForm = useForm();

    const handleLogout = (e) => {
        e.preventDefault();
        logoutForm.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="text-xl font-bold text-gray-900">
                                JCA
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {auth.user.name}
                                {auth.user.role_label && (
                                    <span className="ml-1 text-xs text-gray-400">({auth.user.role_label})</span>
                                )}
                            </span>
                            <button
                                onClick={handleLogout}
                                disabled={logoutForm.processing}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Uitloggen
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
