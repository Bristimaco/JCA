import { useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import TournamentStepper from '../../Components/TournamentStepper';

export default function TournamentsSection({ tournaments, ageCategories, competitionMembers, statuses, availableCoaches }) {
    const { flash } = usePage().props;
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTournament, setEditingTournament] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const statusColors = {
        preparation: 'bg-slate-800 text-slate-300',
        invitations_sent: 'bg-blue-900/40 text-rose-300',
        registrations_open: 'bg-yellow-900/40 text-yellow-700',
        registrations_closed: 'bg-orange-100 text-orange-700',
        started: 'bg-emerald-900/40 text-emerald-400',
        finished: 'bg-purple-900/40 text-purple-400',
        archived: 'bg-purple-900/40 text-purple-400',
    };

    return (
        <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                    Toernooien
                    <span className="ml-2 inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                        {tournaments.length}
                    </span>
                </h2>
                <button
                    onClick={() => { setShowAddForm(!showAddForm); setEditingTournament(null); }}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
                >
                    {showAddForm ? 'Annuleren' : 'Toernooi toevoegen'}
                </button>
            </div>

            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 border ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}

            {showAddForm && (
                <TournamentForm
                    ageCategories={ageCategories}
                    onSuccess={() => setShowAddForm(false)}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {editingTournament && (
                <TournamentForm
                    tournament={editingTournament}
                    ageCategories={ageCategories}
                    onSuccess={() => setEditingTournament(null)}
                    onCancel={() => setEditingTournament(null)}
                />
            )}

            {tournaments.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500">
                    Nog geen toernooien.
                </div>
            ) : (
                <div className="divide-y divide-slate-700">
                    {tournaments.map((tournament) => (
                        <TournamentRow
                            key={tournament.id}
                            tournament={tournament}
                            statusColors={statusColors}
                            statuses={statuses}
                            competitionMembers={competitionMembers}
                            availableCoaches={availableCoaches}
                            isExpanded={expandedId === tournament.id}
                            isEditing={editingTournament?.id === tournament.id}
                            onToggleExpand={() => setExpandedId(expandedId === tournament.id ? null : tournament.id)}
                            onEdit={() => { setEditingTournament(tournament); setShowAddForm(false); }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function TournamentRow({ tournament, statusColors, statuses, competitionMembers, availableCoaches, isExpanded, isEditing, onToggleExpand, onEdit }) {
    const deleteForm = useForm({});
    const statusLabel = statuses.find(s => s.value === tournament.status)?.label || tournament.status;
    const members = tournament.tournament_members || [];

    const handleDelete = () => {
        if (confirm(`Weet je zeker dat je "${tournament.name}" wilt verwijderen?`)) {
            deleteForm.delete(`/admin/tournaments/${tournament.id}`);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE');
    };

    const hasMap = tournament.latitude && tournament.longitude;

    return (
        <div className="px-6 py-4">
            <TournamentStepper status={tournament.status} interactive={true} tournamentId={tournament.id} />
            <div className="flex gap-6">
                {/* Left: details */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-white">{tournament.name}</p>
                            <p className="text-sm text-slate-500">
                                {[tournament.address_street, tournament.address_postal_code, tournament.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                {' · '}{tournament.country_code}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-rose-400 hover:text-rose-300 cursor-pointer" onClick={onToggleExpand}>
                                Leden ({members.length}) {isExpanded ? '▲' : '▼'}
                            </span>
                            <button onClick={onEdit} className="text-sm text-rose-400 hover:text-rose-300">
                                Bewerken
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteForm.processing}
                                className="text-sm text-red-400 hover:text-red-800"
                            >
                                Verwijderen
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs text-slate-500">
                        <span>Toernooi: <strong>{formatDate(tournament.tournament_date)}</strong></span>
                        <span>Uitnodiging deadline: <strong>{formatDate(tournament.invitation_deadline)}</strong></span>
                        <span>Inschrijving deadline: <strong>{formatDate(tournament.registration_deadline)}</strong></span>
                    </div>
                    {tournament.age_categories && tournament.age_categories.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                            {tournament.age_categories.map(cat => (
                                <span key={cat.id} className="inline-flex items-center rounded-full bg-rose-900/30 px-2 py-0.5 text-xs font-medium text-rose-300">
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: map & attachments factbox (hidden when editing) */}
                {!isEditing && (hasMap || (tournament.attachments && tournament.attachments.length > 0)) && (
                    <div className="hidden sm:block shrink-0 w-56 space-y-3">
                        {hasMap && (
                            <div>
                                <iframe
                                    title="Locatie"
                                    width="100%"
                                    height="140"
                                    className="rounded-md border border-slate-700"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${tournament.longitude - 0.01},${tournament.latitude - 0.01},${parseFloat(tournament.longitude) + 0.01},${parseFloat(tournament.latitude) + 0.01}&layer=mapnik&marker=${tournament.latitude},${tournament.longitude}`}
                                />
                                <p className="mt-1 text-center text-xs text-slate-400">
                                    {tournament.address_city || 'Locatie'}
                                </p>
                            </div>
                        )}
                        {tournament.attachments && tournament.attachments.length > 0 && (
                            <div className="rounded-md border border-slate-800 bg-slate-700/50 p-3">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Bijlagen</p>
                                <ul className="space-y-1">
                                    {tournament.attachments.map(att => (
                                        <li key={att.id}>
                                            <a href={att.url} target="_blank" rel="noopener noreferrer"
                                                className="text-xs text-rose-400 hover:underline truncate block">
                                                📎 {att.original_name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isExpanded && (
                <TournamentMembersPanel
                    tournament={tournament}
                    members={members}
                    competitionMembers={competitionMembers}
                    availableCoaches={availableCoaches}
                />
            )}
        </div>
    );
}

function TournamentMembersPanel({ tournament, members, competitionMembers, availableCoaches }) {
    const populateForm = useForm({});
    const inviteAllForm = useForm({});
    const closeForm = useForm({});
    const revertForm = useForm({});
    const openRegForm = useForm({});
    const closeRegForm = useForm({});
    const startForm = useForm({});
    const archiveForm = useForm({});
    const addMemberForm = useForm({ member_id: '' });
    const addCoachForm = useForm({ member_id: '' });
    const [processing, setProcessing] = useState({});

    const invitationStatusColors = {
        pending: 'bg-slate-800 text-slate-400',
        invited: 'bg-blue-900/40 text-rose-300',
        accepted: 'bg-emerald-900/40 text-emerald-400',
        declined: 'bg-red-900/40 text-red-400',
    };

    const hasAgeCategories = tournament.age_categories && tournament.age_categories.length > 0;
    const existingMemberIds = members.map(m => m.id);
    const availableMembers = competitionMembers.filter(m => !existingMemberIds.includes(m.id));
    const pendingCount = members.filter(m => m.invitation_status === 'pending').length;

    const handlePopulate = () => {
        populateForm.post(`/admin/tournaments/${tournament.id}/populate`);
    };

    const handleInviteAll = () => {
        if (confirm(`${pendingCount} uitnodigingen versturen?`)) {
            inviteAllForm.post(`/admin/tournaments/${tournament.id}/invite-all`);
        }
    };

    const handleCloseInvitations = () => {
        if (confirm('Uitnodigingsfase afsluiten? De status wordt "Uitnodigingen verstuurd".')) {
            closeForm.post(`/admin/tournaments/${tournament.id}/close-invitations`);
        }
    };

    const handleRevertStatus = () => {
        if (confirm('Status terugzetten naar de vorige stap?')) {
            revertForm.post(`/admin/tournaments/${tournament.id}/revert-status`);
        }
    };

    const handleOpenRegistrations = () => {
        if (tournament.invitation_deadline && new Date(tournament.invitation_deadline) >= new Date().setHours(0, 0, 0, 0)) {
            if (!confirm('De uitnodigingsdeadline is nog niet verlopen. Toch inschrijvingen starten?')) {
                return;
            }
        }
        if (confirm('Inschrijvingen starten?')) {
            router.post(`/admin/tournaments/${tournament.id}/open-registrations`, { confirmed: '1' });
        }
    };

    const handleRegister = (memberId) => {
        setProcessing(prev => ({ ...prev, [memberId]: true }));
        router.post(`/admin/tournaments/${tournament.id}/register/${memberId}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    const handleUnregister = (memberId, memberName) => {
        if (confirm(`${memberName} uitschrijven?`)) {
            setProcessing(prev => ({ ...prev, [memberId]: true }));
            router.post(`/admin/tournaments/${tournament.id}/unregister/${memberId}`, {}, {
                preserveScroll: true,
                onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
            });
        }
    };

    const handleCloseRegistrations = (confirmed = false) => {
        const accepted = members.filter(m => m.invitation_status === 'accepted');
        const allRegistered = accepted.every(m => m.registration_status === 'registered');

        if (!allRegistered && !confirmed) {
            if (confirm('Niet alle deelnemers zijn ingeschreven. Toch inschrijvingen afsluiten?')) {
                handleCloseRegistrations(true);
            }
            return;
        }

        router.post(`/admin/tournaments/${tournament.id}/close-registrations`, { confirmed: confirmed ? '1' : '0' });
    };

    const handleStartTournament = () => {
        if (confirm('Toernooi starten? Er kunnen hierna geen wijzigingen meer worden gemaakt.')) {
            startForm.post(`/admin/tournaments/${tournament.id}/start`);
        }
    };

    const handleArchiveTournament = () => {
        if (confirm('Toernooi archiveren? Het toernooi verdwijnt uit deze lijst en wordt read-only.')) {
            archiveForm.post(`/admin/tournaments/${tournament.id}/archive`);
        }
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!addMemberForm.data.member_id) return;
        addMemberForm.post(`/admin/tournaments/${tournament.id}/members`, {
            onSuccess: () => addMemberForm.reset(),
        });
    };

    const handleInvite = (memberId) => {
        setProcessing(prev => ({ ...prev, [memberId]: true }));
        router.post(`/admin/tournaments/${tournament.id}/invite/${memberId}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    const handleRemove = (memberId, memberName) => {
        if (confirm(`${memberName} verwijderen van het toernooi?`)) {
            router.delete(`/admin/tournaments/${tournament.id}/members/${memberId}`, {
                preserveScroll: true,
            });
        }
    };

    const coaches = tournament.tournament_coaches || [];
    const existingCoachIds = coaches.map(c => c.id);
    const filteredCoaches = availableCoaches.filter(c => !existingCoachIds.includes(c.id));

    const handleAddCoach = (e) => {
        e.preventDefault();
        if (!addCoachForm.data.member_id) return;
        addCoachForm.post(`/admin/tournaments/${tournament.id}/coaches`, {
            onSuccess: () => addCoachForm.reset(),
        });
    };

    const handleRemoveCoach = (coachId, coachName) => {
        if (confirm(`${coachName} verwijderen als trainer?`)) {
            router.delete(`/admin/tournaments/${tournament.id}/coaches/${coachId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleAdminAccept = (memberId) => {
        setProcessing(prev => ({ ...prev, [memberId]: true }));
        router.post(`/admin/tournaments/${tournament.id}/accept/${memberId}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    const handleAdminDecline = (memberId) => {
        setProcessing(prev => ({ ...prev, [memberId]: true }));
        router.post(`/admin/tournaments/${tournament.id}/decline/${memberId}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    return (
        <div className="mt-4 border border-slate-800 rounded-lg bg-slate-700/50">
            <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center gap-2">
                {tournament.status === 'preparation' && (
                    <button
                        onClick={handlePopulate}
                        disabled={populateForm.processing || !hasAgeCategories}
                        title={!hasAgeCategories ? 'Voeg eerst leeftijdscategorieën toe' : ''}
                        className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                        Leden toevoegen
                    </button>
                )}
                {pendingCount > 0 && (
                    <button
                        onClick={handleInviteAll}
                        disabled={inviteAllForm.processing}
                        className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        Alle uitnodigen ({pendingCount})
                    </button>
                )}
                {members.length > 0 && tournament.status === 'preparation' && (
                    <button
                        onClick={handleCloseInvitations}
                        disabled={closeForm.processing}
                        className="rounded-md bg-orange-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                        Uitnodigingen afsluiten
                    </button>
                )}
                {tournament.status === 'invitations_sent' && (
                    <button
                        onClick={handleOpenRegistrations}
                        disabled={openRegForm.processing}
                        className="rounded-md bg-yellow-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
                    >
                        Inschrijvingen starten
                    </button>
                )}
                {tournament.status === 'registrations_open' && (
                    <button
                        onClick={() => handleCloseRegistrations()}
                        disabled={closeRegForm.processing}
                        className="rounded-md bg-orange-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                    >
                        Inschrijvingen afsluiten
                    </button>
                )}
                {tournament.status === 'registrations_closed' && (
                    <button
                        onClick={handleStartTournament}
                        disabled={startForm.processing}
                        className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        Toernooi starten
                    </button>
                )}
                {tournament.status === 'finished' && (
                    <button
                        onClick={handleArchiveTournament}
                        disabled={archiveForm.processing}
                        className="rounded-md bg-purple-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                        Archiveren
                    </button>
                )}
                {!['preparation', 'started', 'finished'].includes(tournament.status) && (
                    <button
                        onClick={handleRevertStatus}
                        disabled={revertForm.processing}
                        className="rounded-md bg-slate-400 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700/500 disabled:opacity-50"
                    >
                        ← Vorige status
                    </button>
                )}

                {/* Add individual member */}
                {tournament.status === 'preparation' && (
                    <form onSubmit={handleAddMember} className="flex items-center gap-1 ml-auto">
                        <select
                            value={addMemberForm.data.member_id}
                            onChange={e => addMemberForm.setData('member_id', e.target.value)}
                            className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-xs py-1 px-2 max-w-[200px]"
                        >
                            <option value="">Lid toevoegen...</option>
                            {availableMembers.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            disabled={addMemberForm.processing || !addMemberForm.data.member_id}
                            className="rounded-md bg-gray-600 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            +
                        </button>
                    </form>
                )}
            </div>

            {members.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-slate-400">
                    Nog geen leden. Klik op "Leden toevoegen" om competitieleden toe te voegen.
                </div>
            ) : (() => {
                const showSplit = tournament.status !== 'preparation';
                const isRegClosed = ['registrations_closed', 'started', 'finished'].includes(tournament.status);

                let participating, notParticipating;
                if (isRegClosed) {
                    participating = members.filter(m => m.invitation_status === 'accepted' && m.registration_status !== 'unregistered');
                    notParticipating = members.filter(m => m.invitation_status !== 'accepted' || m.registration_status === 'unregistered');
                } else if (showSplit) {
                    participating = members.filter(m => m.invitation_status === 'accepted');
                    notParticipating = members.filter(m => m.invitation_status !== 'accepted');
                } else {
                    participating = members;
                    notParticipating = [];
                }

                const renderMember = (member) => (
                    <tr key={member.id} className="border-t border-slate-700">
                        <td className="px-3 py-2 text-sm text-white whitespace-nowrap">{member.name}</td>
                        <td className="px-3 py-2 text-xs text-slate-400 whitespace-nowrap">{member.date_of_birth}</td>
                        <td className="px-3 py-2 text-xs text-slate-400 whitespace-nowrap">{member.license_number ? `#${member.license_number}` : '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                            {member.age_category ? (
                                <span className="inline-flex items-center rounded-full bg-rose-900/30 px-2 py-0.5 text-xs font-medium text-rose-300">
                                    {member.age_category}
                                </span>
                            ) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                            {member.weight_category ? (
                                <span className="inline-flex items-center rounded-full bg-rose-900/30 px-2 py-0.5 text-xs font-medium text-rose-400">
                                    {member.weight_category}
                                </span>
                            ) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${invitationStatusColors[member.invitation_status] || ''}`}>
                                {member.invitation_status_label}
                            </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                            {member.registration_status === 'registered' && (
                                <span className="inline-flex items-center rounded-full bg-emerald-900/40 text-emerald-400 px-2 py-0.5 text-xs font-medium">
                                    Ingeschreven
                                </span>
                            )}
                            {member.registration_status === 'unregistered' && (
                                <span className="inline-flex items-center rounded-full bg-red-900/40 text-red-400 px-2 py-0.5 text-xs font-medium">
                                    Uitgeschreven
                                </span>
                            )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                                {member.invitation_status === 'pending' && tournament.status === 'preparation' && (
                                    <button
                                        onClick={() => handleInvite(member.id)}
                                        disabled={processing[member.id]}
                                        className="text-xs text-emerald-600 hover:text-emerald-400 disabled:opacity-50"
                                    >
                                        Uitnodigen
                                    </button>
                                )}
                                {member.invitation_status === 'invited' && (
                                    <>
                                        <button
                                            onClick={() => handleAdminAccept(member.id)}
                                            disabled={processing[member.id]}
                                            className="text-xs text-emerald-600 hover:text-emerald-400 disabled:opacity-50"
                                            title="Accepteren namens lid"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => handleAdminDecline(member.id)}
                                            disabled={processing[member.id]}
                                            className="text-xs text-red-500 hover:text-red-400 disabled:opacity-50"
                                            title="Afslaan namens lid"
                                        >
                                            ✗
                                        </button>
                                    </>
                                )}
                                {tournament.status === 'registrations_open' && member.invitation_status === 'accepted' && member.registration_status !== 'registered' && (
                                    <button
                                        onClick={() => handleRegister(member.id)}
                                        disabled={processing[member.id]}
                                        className="text-xs text-emerald-600 hover:text-emerald-400 disabled:opacity-50"
                                    >
                                        Inschrijven
                                    </button>
                                )}
                                {tournament.status === 'registrations_open' && member.registration_status === 'registered' && (
                                    <button
                                        onClick={() => handleUnregister(member.id, member.name)}
                                        disabled={processing[member.id]}
                                        className="text-xs text-red-500 hover:text-red-400 disabled:opacity-50"
                                    >
                                        Uitschrijven
                                    </button>
                                )}
                                {tournament.status === 'preparation' && (
                                    <button
                                        onClick={() => handleRemove(member.id, member.name)}
                                        className="text-xs text-red-500 hover:text-red-400"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                );

                const tableHeader = (
                    <thead>
                        <tr className="bg-slate-700/50 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <th className="px-3 py-2">Naam</th>
                            <th className="px-3 py-2">Geboortedatum</th>
                            <th className="px-3 py-2">Licentie</th>
                            <th className="px-3 py-2">Categorie</th>
                            <th className="px-3 py-2">Gewicht</th>
                            <th className="px-3 py-2">Uitnodiging</th>
                            <th className="px-3 py-2">Inschrijving</th>
                            <th className="px-3 py-2 text-right">Acties</th>
                        </tr>
                    </thead>
                );

                return (
                    <>
                        <table className="w-full">
                            {tableHeader}
                            <tbody>
                                {participating.map(renderMember)}
                            </tbody>
                        </table>
                        {notParticipating.length > 0 && (
                            <>
                                <div className="px-4 py-2 bg-slate-900 border-t border-b border-slate-800">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Niet-deelnemers ({notParticipating.length})</span>
                                </div>
                                <table className="w-full opacity-60">
                                    <tbody>
                                        {notParticipating.map(renderMember)}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </>
                );
            })()}

            {/* Trainers section */}
            <div className="border-t border-slate-700">
                <div className="px-4 py-3 flex items-center justify-between gap-2 bg-slate-900">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Trainers ({coaches.length})
                    </span>
                    <form onSubmit={handleAddCoach} className="flex items-center gap-1">
                        <select
                            value={addCoachForm.data.member_id}
                            onChange={e => addCoachForm.setData('member_id', e.target.value)}
                            className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-xs py-1 px-2 max-w-[200px]"
                        >
                            <option value="">Trainer toevoegen...</option>
                            {filteredCoaches.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            disabled={addCoachForm.processing || !addCoachForm.data.member_id}
                            className="rounded-md bg-gray-600 px-2 py-1 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            +
                        </button>
                    </form>
                </div>
                {coaches.length === 0 ? (
                    <div className="px-4 py-4 text-center text-xs text-slate-400">
                        Nog geen trainers toegewezen.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {coaches.map(coach => (
                            <div key={coach.id} className="px-4 py-2 flex items-center justify-between gap-3">
                                <span className="text-sm text-white">{coach.name}</span>
                                <button
                                    onClick={() => handleRemoveCoach(coach.id, coach.name)}
                                    className="text-xs text-red-500 hover:text-red-400"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function TournamentForm({ tournament, ageCategories, onSuccess, onCancel }) {
    const isEditing = !!tournament;
    const form = useForm({
        name: tournament?.name || '',
        address_street: tournament?.address_street || '',
        address_city: tournament?.address_city || '',
        address_postal_code: tournament?.address_postal_code || '',
        country_code: tournament?.country_code || 'BE',
        latitude: tournament?.latitude || '',
        longitude: tournament?.longitude || '',
        tournament_date: tournament?.tournament_date ? tournament.tournament_date.split('T')[0] : '',
        invitation_deadline: tournament?.invitation_deadline ? tournament.invitation_deadline.split('T')[0] : '',
        registration_deadline: tournament?.registration_deadline ? tournament.registration_deadline.split('T')[0] : '',
        age_category_ids: tournament?.age_category_ids || [],
        attachments: [],
        remove_attachment_ids: [],
    });

    const countries = [...new Set(ageCategories.map(c => c.country_code))].sort();
    const filteredAgeCategories = ageCategories.filter(c => c.country_code === form.data.country_code);

    const toggleAgeCategory = (id) => {
        const current = form.data.age_category_ids;
        if (current.includes(id)) {
            form.setData('age_category_ids', current.filter(x => x !== id));
        } else {
            form.setData('age_category_ids', [...current, id]);
        }
    };

    const toggleRemoveAttachment = (id) => {
        const current = form.data.remove_attachment_ids;
        if (current.includes(id)) {
            form.setData('remove_attachment_ids', current.filter(x => x !== id));
        } else {
            form.setData('remove_attachment_ids', [...current, id]);
        }
    };

    const geocodeAddress = async () => {
        const address = [form.data.address_street, form.data.address_postal_code, form.data.address_city, form.data.country_code].filter(Boolean).join(', ');
        if (!address) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const data = await res.json();
            if (data.length > 0) {
                form.setData(prev => ({ ...prev, latitude: data[0].lat, longitude: data[0].lon }));
            }
        } catch {
            // Geocoding failed silently
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            form.post(`/admin/tournaments/${tournament.id}`, {
                onSuccess,
                forceFormData: true,
            });
        } else {
            form.post('/admin/tournaments', {
                onSuccess: () => { form.reset(); onSuccess(); },
                forceFormData: true,
            });
        }
    };

    const hasMap = form.data.latitude && form.data.longitude;

    return (
        <form onSubmit={handleSubmit} className="px-6 py-4 bg-slate-700/50 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
                {isEditing ? `Bewerk: ${tournament.name}` : 'Nieuw toernooi'}
            </h3>
            <div className="flex gap-6">
                {/* Left: form fields */}
                <div className="min-w-0 flex-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Naam *</label>
                            <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                            {form.errors.name && <p className="text-xs text-red-400 mt-1">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Land *</label>
                            <select value={form.data.country_code} onChange={e => form.setData('country_code', e.target.value)}
                                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Straat + nr</label>
                            <input type="text" value={form.data.address_street} onChange={e => form.setData('address_street', e.target.value)}
                                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Postcode</label>
                            <input type="text" value={form.data.address_postal_code} onChange={e => form.setData('address_postal_code', e.target.value)}
                                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Stad</label>
                            <input type="text" value={form.data.address_city} onChange={e => form.setData('address_city', e.target.value)}
                                onBlur={geocodeAddress}
                                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                        </div>
                    </div>

                    {/* Datums block */}
                    <div className="mb-3 rounded-lg border border-slate-800 bg-slate-800/50 p-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Datums</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Uitnodiging deadline *</label>
                                <input type="date" value={form.data.invitation_deadline} onChange={e => form.setData('invitation_deadline', e.target.value)}
                                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                                {form.errors.invitation_deadline && <p className="text-xs text-red-400 mt-1">{form.errors.invitation_deadline}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Inschrijving deadline *</label>
                                <input type="date" value={form.data.registration_deadline} onChange={e => form.setData('registration_deadline', e.target.value)}
                                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                                {form.errors.registration_deadline && <p className="text-xs text-red-400 mt-1">{form.errors.registration_deadline}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Toernooidatum *</label>
                                <input type="date" value={form.data.tournament_date} onChange={e => form.setData('tournament_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                                {form.errors.tournament_date && <p className="text-xs text-red-400 mt-1">{form.errors.tournament_date}</p>}
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Uitnodiging deadline &lt; Inschrijving deadline &lt; Toernooidatum</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Bijlagen</label>
                            <input type="file" multiple onChange={e => form.setData('attachments', Array.from(e.target.files))}
                                className="w-full text-sm text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-300 hover:file:bg-slate-700" />
                            {form.errors.attachments && <p className="text-xs text-red-400 mt-1">{form.errors.attachments}</p>}
                        </div>
                    </div>

                    {/* Existing attachments (edit mode) */}
                    {isEditing && tournament.attachments && tournament.attachments.length > 0 && (
                        <div className="mb-3">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Bestaande bijlagen</label>
                            <div className="flex flex-wrap gap-2">
                                {tournament.attachments.map(att => (
                                    <span key={att.id} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${form.data.remove_attachment_ids.includes(att.id) ? 'bg-red-900/40 text-red-400 line-through' : 'bg-slate-800 text-slate-300'}`}>
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{att.original_name}</a>
                                        <button type="button" onClick={() => toggleRemoveAttachment(att.id)}
                                            className="ml-0.5 text-slate-500 hover:text-red-400">&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Age categories checkboxes */}
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Leeftijdscategorieën ({form.data.country_code}) *</label>
                        {form.errors.age_category_ids && <p className="text-xs text-red-400 mb-1">{form.errors.age_category_ids}</p>}
                        {filteredAgeCategories.length === 0 ? (
                            <p className="text-xs text-slate-400">Geen categorieën voor {form.data.country_code}</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {filteredAgeCategories.map(cat => (
                                    <label key={cat.id} className="flex items-center gap-1.5 text-sm text-slate-300">
                                        <input type="checkbox"
                                            checked={form.data.age_category_ids.includes(cat.id)}
                                            onChange={() => toggleAgeCategory(cat.id)}
                                            className="rounded border-slate-600 bg-slate-700 text-rose-400 focus:ring-rose-500" />
                                        {cat.name} ({cat.min_age}–{cat.max_age})
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: map factbox */}
                {hasMap && (
                    <div className="hidden sm:block shrink-0 w-56">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Locatie</label>
                        <iframe
                            title="Locatie"
                            width="100%"
                            height="180"
                            className="rounded-md border border-slate-700"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.data.longitude - 0.01},${form.data.latitude - 0.01},${parseFloat(form.data.longitude) + 0.01},${parseFloat(form.data.latitude) + 0.01}&layer=mapnik&marker=${form.data.latitude},${form.data.longitude}`}
                        />
                        <p className="mt-1 text-center text-xs text-slate-400">
                            {form.data.address_city || 'Locatie'}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button type="submit" disabled={form.processing}
                    className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50">
                    {isEditing ? 'Opslaan' : 'Toernooi aanmaken'}
                </button>
                <button type="button" onClick={onCancel}
                    className="rounded-md bg-slate-700/50 border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50">
                    Annuleren
                </button>
            </div>
        </form>
    );
}
