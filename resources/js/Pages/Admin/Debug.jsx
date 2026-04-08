import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

const tiles = [
    {
        name: 'Bestellingen',
        href: '/admin/debug/bestellingen',
        countKey: 'barOrderCount',
        icon: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
        ),
        color: 'from-amber-600 to-orange-700',
    },
];

export default function Debug({ barOrderCount }) {
    const counts = { barOrderCount };

    return (
        <AppLayout>
            <Head title="Debug" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Debug</h1>
                <p className="text-sm text-slate-400 mt-1">Overzicht van data in het systeem</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {tiles.map((tile) => (
                    <Link
                        key={tile.name}
                        href={tile.href}
                        className={`relative rounded-xl bg-gradient-to-br ${tile.color} p-5 shadow-lg hover:scale-[1.02] transition-transform`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-white/80">{tile.icon}</div>
                            <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-full bg-white/20 text-white text-sm font-bold px-2">
                                {counts[tile.countKey] ?? 0}
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-white">{tile.name}</p>
                    </Link>
                ))}
            </div>
        </AppLayout>
    );
}
