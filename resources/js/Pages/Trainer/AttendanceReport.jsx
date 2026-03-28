import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

const periodOptions = [
    { label: '3 maanden', value: 3 },
    { label: '6 maanden', value: 6 },
    { label: '1 jaar', value: 12 },
    { label: 'Alles', value: 0 },
];

export default function AttendanceReport({ report, threshold, months }) {
    const handlePeriodChange = (e) => {
        router.get(window.location.pathname, { months: e.target.value }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Aanwezigheidsrapport" />
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-white">Aanwezigheidsrapport</h1>
                    <div className="flex items-center gap-4">
                        <select
                            value={months}
                            onChange={handlePeriodChange}
                            className="rounded-md border border-slate-600 bg-slate-800 text-white text-sm px-3 py-2 focus:border-rose-500 focus:ring-rose-500"
                        >
                            {periodOptions.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <Link href="/" className="text-sm font-medium text-rose-400 hover:text-rose-300">
                            ← Dashboard
                        </Link>
                    </div>
                </div>

                <p className="text-sm text-slate-400 mb-6">
                    Drempel: <span className="font-semibold text-white">{threshold}%</span> — leden onder dit percentage worden rood gemarkeerd.
                </p>

                {report.length === 0 ? (
                    <div className="bg-slate-900 rounded-xl p-8 text-center ring-1 ring-slate-800">
                        <p className="text-slate-400">Geen trainingsdata gevonden voor deze periode.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {report.map(group => (
                            <GroupTable key={group.id} group={group} threshold={threshold} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function GroupTable({ group, threshold }) {
    return (
        <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{group.name}</h2>
                <span className="text-xs text-slate-500">{group.total_sessions} {group.total_sessions === 1 ? 'sessie' : 'sessies'}</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="sticky left-0 z-10 bg-slate-900 text-left px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[160px]">
                                Lid
                            </th>
                            {group.sessions.map(s => (
                                <th key={s.id} className="px-1.5 py-2 text-center text-[10px] text-slate-500 whitespace-nowrap min-w-[40px]">
                                    <div>{new Date(s.date).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' })}</div>
                                </th>
                            ))}
                            <th className="sticky right-0 z-10 bg-slate-900 px-4 py-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[60px]">
                                %
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {group.members.map(member => {
                            const belowThreshold = member.percentage < threshold;
                            return (
                                <tr
                                    key={member.id}
                                    className={belowThreshold ? 'bg-red-950/20' : 'bg-emerald-950/10'}
                                >
                                    <td className={`sticky left-0 z-10 px-4 py-2 font-medium whitespace-nowrap ${belowThreshold ? 'bg-red-950/30 text-red-300' : 'bg-emerald-950/20 text-emerald-300'}`}>
                                        {member.name}
                                    </td>
                                    {group.sessions.map(s => {
                                        const attended = member.attended_session_ids.includes(s.id);
                                        return (
                                            <td key={s.id} className="px-1.5 py-2 text-center">
                                                {attended ? (
                                                    <span className="text-emerald-400">✓</span>
                                                ) : (
                                                    <span className="text-red-400/50">✗</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className={`sticky right-0 z-10 px-4 py-2 text-right font-bold ${belowThreshold ? 'bg-red-950/30 text-red-400' : 'bg-emerald-950/20 text-emerald-400'}`}>
                                        {member.percentage}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
