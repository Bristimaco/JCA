import { Link, usePage, useForm } from '@inertiajs/react';

export default function AppLayout({ children }) {
    const { auth, club } = usePage().props;
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
                            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                {club?.has_logo && (
                                    <img src="/club-logo" alt="" className="h-8 w-8 object-contain" />
                                )}
                                {club?.name || 'JCA'}
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {auth.user.name}
                                {auth.user.role_label && (
                                    <span className="ml-1 text-xs text-gray-400">({auth.user.role_label})</span>
                                )}
                            </span>
                            <a
                                href="/handleiding.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Handleiding"
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.061-1.061 3.25 3.25 0 1 1 4.596 4.596l-.459.459a1.75 1.75 0 0 0-.513 1.237V13a.75.75 0 0 1-1.5 0v-.878c0-.894.355-1.752.988-2.384l.459-.459a1.75 1.75 0 0 0-2.51-2.34ZM10 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                                </svg>
                            </a>
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
