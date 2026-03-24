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
        preparation: 'bg-gray-100 text-gray-700',
        invitations_sent: 'bg-blue-100 text-blue-700',
        registrations_open: 'bg-yellow-100 text-yellow-700',
        registrations_closed: 'bg-orange-100 text-orange-700',
        started: 'bg-green-100 text-green-700',
        finished: 'bg-purple-100 text-purple-700',
        archived: 'bg-purple-100 text-purple-700',
    };

    return (
        <AppLayout>
            <Head title={t.name} />

            <div className="mb-6 flex items-center gap-4">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                    &larr; Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{t.name}</h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[t.status] || ''}`}>
                    {t.status_label}
                </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column: Info + map */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Tournament info card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Details</h2>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-gray-500">Datum</dt>
                                <dd className="font-medium text-gray-900">{formatDate(t.tournament_date)}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Locatie</dt>
                                <dd className="font-medium text-gray-900">
                                    {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Land</dt>
                                <dd className="font-medium text-gray-900">{t.country_code}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Deelnemers</dt>
                                <dd className="font-medium text-gray-900">{totalParticipants}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Map */}
                    {hasMap && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100">
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Bijlagen</h2>
                            </div>
                            <div className="space-y-3 p-4">
                                {t.attachments.map(att => (
                                    <div key={att.id}>
                                        {att.mime_type && att.mime_type.startsWith('image/') ? (
                                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={att.url}
                                                    alt={att.original_name}
                                                    className="w-full rounded border border-gray-200"
                                                />
                                            </a>
                                        ) : att.mime_type === 'application/pdf' ? (
                                            <div>
                                                <iframe
                                                    src={att.url}
                                                    title={att.original_name}
                                                    className="w-full rounded border border-gray-200"
                                                    style={{ height: '400px' }}
                                                />
                                                <a href={att.url} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                                                    {att.original_name}
                                                </a>
                                            </div>
                                        ) : (
                                            <a href={att.url} target="_blank" rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline">
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
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Trainers</h2>
                            <ul className="space-y-1">
                                {t.coaches.map(c => (
                                    <li key={c.id} className="text-sm text-gray-900">{c.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right column: Participants grouped by age/weight */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-5 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Deelnemers
                                <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                    {totalParticipants}
                                </span>
                            </h2>
                        </div>

                        {participantGroups.length === 0 ? (
                            <div className="px-5 py-8 text-center text-gray-500">
                                Nog geen deelnemers.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {participantGroups.map(ageGroup => (
                                    <div key={ageGroup.name} className="px-5 py-4">
                                        <h3 className="text-sm font-semibold text-gray-800 mb-3">
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                                {ageGroup.name}
                                            </span>
                                        </h3>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {ageGroup.weights.map(weightGroup => (
                                                <div key={weightGroup.name} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                                    <h4 className="text-xs font-semibold text-amber-700 mb-2">
                                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5">
                                                            {weightGroup.name}
                                                        </span>
                                                        <span className="ml-1.5 text-gray-400 font-normal">
                                                            ({weightGroup.members.length})
                                                        </span>
                                                    </h4>
                                                    <ul className="space-y-1">
                                                        {weightGroup.members.map(member => (
                                                            <li key={member.id} className="flex items-center justify-between text-sm text-gray-700">
                                                                <span>{member.name}</span>
                                                                {member.result && (
                                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${member.result === '1e plaats' ? 'bg-yellow-100 text-yellow-800' :
                                                                        member.result === '2e plaats' ? 'bg-gray-200 text-gray-800' :
                                                                            member.result === '3e plaats' ? 'bg-amber-100 text-amber-800' :
                                                                                'bg-gray-100 text-gray-600'
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
