import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';

export default function TournamentDetail({ tournament, participantGroups, totalParticipants }) {
    const t = tournament;
    const hasMap = t.latitude && t.longitude;

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const statusColors = {
        preparation: 'bg-slate-800 text-slate-300',
        invitations_sent: 'bg-rose-900/30 text-blue-400',
        registrations_open: 'bg-yellow-900/40 text-yellow-700',
        registrations_closed: 'bg-orange-100 text-orange-700',
        started: 'bg-emerald-900/40 text-emerald-400',
        finished: 'bg-purple-900/40 text-purple-400',
        archived: 'bg-purple-900/40 text-purple-400',
    };

    return (
        <AppLayout>
            <Head title={t.name} />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm font-medium text-slate-400 hover:text-slate-400">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white tracking-tight">{t.name}</h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[t.status] || ''}`}>
                    {t.status_label}
                </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column: Info + map */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Tournament info card */}
                    <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800/60 border-t-2 border-t-rose-700 p-5">
                        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Details</h2>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-slate-400 text-xs">Datum</dt>
                                <dd className="font-medium text-white">{formatDate(t.tournament_date)}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-xs">Locatie</dt>
                                <dd className="font-medium text-white">
                                    {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-xs">Land</dt>
                                <dd className="font-medium text-white">{t.country_code}</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-xs">Deelnemers</dt>
                                <dd className="font-medium text-white">{totalParticipants}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Map */}
                    {hasMap && (
                        <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800/60 border-t-2 border-t-rose-700 overflow-hidden">
                            <iframe
                                title="Locatie"
                                width="100%"
                                height="220"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${t.longitude - 0.01},${t.latitude - 0.01},${parseFloat(t.longitude) + 0.01},${parseFloat(t.latitude) + 0.01}&layer=mapnik&marker=${t.latitude},${t.longitude}`}
                            />
                        </div>
                    )}

                    {/* Attachments / Flyers */}
                    {t.attachments.length > 0 && (
                        <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800/60 border-t-2 border-t-rose-700 overflow-hidden">
                            <div className="px-5 py-3 border-b border-slate-800">
                                <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bijlagen</h2>
                            </div>
                            <div className="space-y-3 p-4">
                                {t.attachments.map(att => (
                                    <div key={att.id}>
                                        {att.mime_type && att.mime_type.startsWith('image/') ? (
                                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={att.url}
                                                    alt={att.original_name}
                                                    className="w-full rounded-lg ring-1 ring-slate-800/60"
                                                />
                                            </a>
                                        ) : att.mime_type === 'application/pdf' ? (
                                            <div>
                                                <iframe
                                                    src={att.url}
                                                    title={att.original_name}
                                                    className="w-full rounded-lg ring-1 ring-slate-800/60"
                                                    style={{ height: '400px' }}
                                                />
                                                <a href={att.url} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-rose-400 hover:underline mt-1 inline-block">
                                                    {att.original_name}
                                                </a>
                                            </div>
                                        ) : (
                                            <a href={att.url} target="_blank" rel="noopener noreferrer"
                                                className="text-sm text-rose-400 hover:underline">
                                                {att.original_name}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Coaches */}
                    {t.coaches.length > 0 && (
                        <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800/60 border-t-2 border-t-rose-700 p-5">
                            <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Trainers</h2>
                            <ul className="space-y-1">
                                {t.coaches.map(c => (
                                    <li key={c.id} className="text-sm text-white">{c.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right column: Participants grouped by age/weight */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800/60 border-t-2 border-t-rose-700">
                        <div className="px-5 py-4 border-b border-slate-800/60">
                            <h2 className="text-lg font-semibold text-white">
                                Deelnemers
                                <span className="ml-2 inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                                    {totalParticipants}
                                </span>
                            </h2>
                        </div>

                        {participantGroups.length === 0 ? (
                            <div className="px-5 py-12 text-center text-slate-400">
                                Nog geen deelnemers.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700">
                                {participantGroups.map(ageGroup => (
                                    <div key={ageGroup.name} className="px-5 py-4">
                                        <h3 className="text-sm font-semibold text-slate-200 mb-3">
                                            <span className="inline-flex items-center rounded-full bg-rose-900/30 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
                                                {ageGroup.name}
                                            </span>
                                        </h3>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {ageGroup.weights.map(weightGroup => (
                                                <div key={weightGroup.name} className="rounded-xl ring-1 ring-slate-800 bg-slate-700/30 p-3">
                                                    <h4 className="text-xs font-semibold text-rose-400 mb-2">
                                                        <span className="inline-flex items-center rounded-full bg-rose-900/30 px-2 py-0.5">
                                                            {weightGroup.name}
                                                        </span>
                                                        <span className="ml-1.5 text-slate-400 font-normal">
                                                            ({weightGroup.members.length})
                                                        </span>
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {weightGroup.members.map(member => (
                                                            <li key={member.id} className="flex items-center justify-between text-sm text-slate-300">
                                                                <span>{member.name}</span>
                                                                {member.result && (
                                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${member.result === '1e plaats' ? 'bg-yellow-900/40 text-yellow-400' :
                                                                        member.result === '2e plaats' ? 'bg-slate-200 text-slate-200' :
                                                                            member.result === '3e plaats' ? 'bg-amber-900/40 text-amber-300' :
                                                                                'bg-slate-800 text-slate-400'
                                                                        }`}>
                                                                        {member.result}
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
