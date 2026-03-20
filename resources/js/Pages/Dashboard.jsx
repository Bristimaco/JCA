import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';

const modules = [
    { name: 'Admin', href: '/admin', roles: ['admin'] },
    { name: 'Leden', href: '/admin/members', roles: ['admin'] },
];

export default function Dashboard({ pendingCount }) {
    const { auth } = usePage().props;
    const role = auth.user.role;

    const visibleModules = modules.filter(
        (m) => m.roles.includes(role)
    );

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Welkom, {auth.user.name}!</p>
            </div>

            {visibleModules.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {visibleModules.map((m) => (
                        <Link
                            key={m.name}
                            href={m.href}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-400 hover:shadow transition-all text-center"
                        >
                            <span className="text-lg font-semibold text-gray-900">{m.name}</span>
                            {m.name === 'Admin' && pendingCount > 0 && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                    {pendingCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
