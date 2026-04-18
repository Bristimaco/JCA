import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { PendingUsersSection, UnverifiedUsersSection, UsersSection } from '../Dashboard/UsersSections';

export default function Users({ unverifiedUsers, pendingUsers, users, roles, extraModules, allMembers, renewalDueCount, renewalDueMembers }) {
    const urlParams = new URLSearchParams(window.location.search);
    const [renewalListOpen, setRenewalListOpen] = useState(urlParams.get('renewal') === 'open');

    return (
        <AppLayout>
            <Head title="Gebruikersbeheer" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Gebruikersbeheer</h1>
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-300">
                    ← Dashboard
                </Link>
            </div>

            {renewalDueCount > 0 && (
                <div className="mb-6 rounded-xl bg-amber-900/30 ring-1 ring-amber-700/30 overflow-hidden">
                    <button
                        onClick={() => setRenewalListOpen(!renewalListOpen)}
                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-amber-900/20 transition-colors"
                    >
                        <span className="text-2xl">💳</span>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-400">
                                {renewalDueCount} {renewalDueCount === 1 ? 'lid heeft' : 'leden hebben'} een vernieuwing nodig
                            </p>
                            <p className="text-xs text-amber-500/80 mt-0.5">Lidmaatschap verloopt binnen 30 dagen of is al verlopen</p>
                        </div>
                        <svg className={`w-5 h-5 text-amber-400 transition-transform ${renewalListOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {renewalListOpen && renewalDueMembers && (
                        <div className="border-t border-amber-700/30 divide-y divide-amber-700/20">
                            {renewalDueMembers.map((m) => {
                                const d = new Date(m.membership_renewal_date);
                                const days = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
                                const overdue = days < 0;
                                return (
                                    <div key={m.id} className="px-4 py-3 flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{m.name}</p>
                                            {m.email && <p className="text-xs text-slate-400 truncate">{m.email}</p>}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-xs font-medium ${overdue ? 'text-red-400' : 'text-amber-400'}`}>
                                                {d.toLocaleDateString('nl-BE')}
                                            </p>
                                            <p className={`text-xs ${overdue ? 'text-red-500' : 'text-amber-500/70'}`}>
                                                {overdue ? `${Math.abs(days)} dagen verlopen` : `nog ${days} dagen`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-6">
                <UnverifiedUsersSection unverifiedUsers={unverifiedUsers} />
                <PendingUsersSection pendingUsers={pendingUsers} roles={roles} extraModules={extraModules} />
                <UsersSection users={users} roles={roles} extraModules={extraModules} allMembers={allMembers} />
            </div>
        </AppLayout>
    );
}
