import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';

const modules = [
    { name: 'Mijn Leden', href: '/mijn-leden', roles: ['parent', 'member', 'admin', 'coach'] },
    { name: 'Leden', href: '/admin/members', roles: ['admin'] },
    { name: 'Admin', href: '/admin', roles: ['admin'] },
];

export default function Dashboard({ pendingCount, memberStats, myMemberCount }) {
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
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-400 hover:shadow transition-all"
                        >
                            <div className="text-center">
                                <span className="text-lg font-semibold text-gray-900">{m.name}</span>
                                {m.name === 'Admin' && pendingCount > 0 && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                        {pendingCount}
                                    </span>
                                )}
                                {m.name === 'Leden' && memberStats && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                        {memberStats.total}
                                    </span>
                                )}
                                {m.name === 'Mijn Leden' && myMemberCount > 0 && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                        {myMemberCount}
                                    </span>
                                )}
                            </div>

                            {m.name === 'Leden' && memberStats && (memberStats.gender.length > 0 || memberStats.belts.length > 0) && (
                                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-left">
                                    {memberStats.gender.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Geslacht</p>
                                            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                                {memberStats.gender.map((g) => (
                                                    <span key={g.label} className="text-xs text-gray-600">
                                                        {g.label} <span className="font-medium text-gray-800">{g.count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {memberStats.belts.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Gordels</p>
                                            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                                {memberStats.belts.map((b) => (
                                                    <span key={b.label} className="text-xs text-gray-600">
                                                        {b.label} <span className="font-medium text-gray-800">{b.count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
