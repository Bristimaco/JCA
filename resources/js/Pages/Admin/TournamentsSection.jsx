import { useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function TournamentsSection({ tournaments, ageCategories, competitionMembers, statuses }) {
    const { flash } = usePage().props;
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTournament, setEditingTournament] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const statusColors = {
        preparation: 'bg-gray-100 text-gray-700',
        invitations_sent: 'bg-blue-100 text-blue-700',
        registrations_open: 'bg-yellow-100 text-yellow-700',
        registrations_closed: 'bg-orange-100 text-orange-700',
        started: 'bg-green-100 text-green-700',
        finished: 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Toernooien
                    <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {tournaments.length}
                    </span>
                </h2>
                <button
                    onClick={() => { setShowAddForm(!showAddForm); setEditingTournament(null); }}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                    {showAddForm ? 'Annuleren' : 'Toernooi toevoegen'}
                </button>
            </div>

            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-green-50 border border-green-200 p-3">
                    <p className="text-sm text-green-800">{flash.status}</p>
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
                <div className="px-6 py-8 text-center text-gray-500">
                    Nog geen toernooien.
                </div>
            ) : (
                <div className="divide-y divide-gray-200">
                    {tournaments.map((tournament) => (
                        <TournamentRow
                            key={tournament.id}
                            tournament={tournament}
                            statusColors={statusColors}
                            statuses={statuses}
                            competitionMembers={competitionMembers}
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

function TournamentRow({ tournament, statusColors, statuses, competitionMembers, isExpanded, isEditing, onToggleExpand, onEdit }) {
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
            <div className="flex gap-6">
                {/* Left: details */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">{tournament.name}</p>
                            <p className="text-sm text-gray-500">
                                {[tournament.address_street, tournament.address_postal_code, tournament.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                {' · '}{tournament.country_code}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[tournament.status] || ''}`}>
                                {statusLabel}
                            </span>
                            <button onClick={onToggleExpand} className="text-sm text-gray-600 hover:text-gray-800">
                                Leden ({members.length}) {isExpanded ? '▲' : '▼'}
                            </button>
                            <button onClick={onEdit} className="text-sm text-blue-600 hover:text-blue-800">
                                Bewerken
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteForm.processing}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Verwijderen
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs text-gray-500">
                        <span>Toernooi: <strong>{formatDate(tournament.tournament_date)}</strong></span>
                        <span>Uitnodiging deadline: <strong>{formatDate(tournament.invitation_deadline)}</strong></span>
                        <span>Inschrijving deadline: <strong>{formatDate(tournament.registration_deadline)}</strong></span>
                    </div>
                    {tournament.age_categories && tournament.age_categories.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                            {tournament.age_categories.map(cat => (
                                <span key={cat.id} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                    )}
                    {tournament.attachments && tournament.attachments.length > 0 && (
                        <div className="flex gap-2 mt-2">
                            {tournament.attachments.map(att => (
                                <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline">
                                    {att.original_name}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: map factbox (hidden when editing to avoid duplicate with form map) */}
                {hasMap && !isEditing && (
                    <div className="hidden sm:block shrink-0 w-56">
                        <iframe
                            title="Locatie"
                            width="100%"
                            height="140"
                            className="rounded-md border border-gray-200"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${tournament.longitude - 0.01},${tournament.latitude - 0.01},${parseFloat(tournament.longitude) + 0.01},${parseFloat(tournament.latitude) + 0.01}&layer=mapnik&marker=${tournament.latitude},${tournament.longitude}`}
                        />
                        <p className="mt-1 text-center text-xs text-gray-400">
                            {tournament.address_city || 'Locatie'}
                        </p>
                    </div>
                )}
            </div>

            {isExpanded && (
                <TournamentMembersPanel
                    tournament={tournament}
                    members={members}
                    competitionMembers={competitionMembers}
                />
            )}
        </div>
    );
}

function TournamentMembersPanel({ tournament, members, competitionMembers }) {
    const populateForm = useForm({});
    const inviteAllForm = useForm({});
    const closeForm = useForm({});
    const revertForm = useForm({});
    const openRegForm = useForm({});
    const closeRegForm = useForm({});
    const startForm = useForm({});
    const addMemberForm = useForm({ member_id: '' });
    const [processing, setProcessing] = useState({});

    const invitationStatusColors = {
        pending: 'bg-gray-100 text-gray-600',
        invited: 'bg-blue-100 text-blue-700',
        accepted: 'bg-green-100 text-green-700',
        declined: 'bg-red-100 text-red-700',
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
        if (confirm('Inschrijvingen starten?')) {
            openRegForm.post(`/admin/tournaments/${tournament.id}/open-registrations`);
        }
    };

    const handleRegister = (memberId) => {
        setProcessing(prev => ({ ...prev, [memberId]: true }));
        router.post(`/admin/tournaments/${tournament.id}/register/${memberId}`, {}, {
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    const handleUnregister = (memberId, memberName) => {
        if (confirm(`${memberName} uitschrijven?`)) {
            setProcessing(prev => ({ ...prev, [memberId]: true }));
            router.post(`/admin/tournaments/${tournament.id}/unregister/${memberId}`, {}, {
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
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    const handleRemove = (memberId, memberName) => {
        if (confirm(`${memberName} verwijderen van het toernooi?`)) {
            router.delete(`/admin/tournaments/${tournament.id}/members/${memberId}`);
        }
    };

    return (
        <div className="mt-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-2">
                {tournament.status === 'preparation' && (
                    <button
                        onClick={handlePopulate}
                        disabled={populateForm.processing || !hasAgeCategories}
                        title={!hasAgeCategories ? 'Voeg eerst leeftijdscategorieën toe' : ''}
                        className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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
                {!['preparation', 'started', 'finished'].includes(tournament.status) && (
                    <button
                        onClick={handleRevertStatus}
                        disabled={revertForm.processing}
                        className="rounded-md bg-gray-400 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-500 disabled:opacity-50"
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
                            className="rounded-md border border-gray-300 text-xs py-1 px-2 max-w-[200px]"
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
                <div className="px-4 py-6 text-center text-xs text-gray-400">
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
                    <div key={member.id} className="px-4 py-2 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1 flex items-center gap-3">
                            <span className="text-sm text-gray-900">{member.name}</span>
                            <span className="text-xs text-gray-400">{member.date_of_birth}</span>
                            {member.age_category && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                    {member.age_category}
                                </span>
                            )}
                            {member.weight_category && (
                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                    {member.weight_category}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${invitationStatusColors[member.invitation_status] || ''}`}>
                                {member.invitation_status_label}
                            </span>
                            {member.registration_status === 'registered' && (
                                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium">
                                    Ingeschreven
                                </span>
                            )}
                            {member.registration_status === 'unregistered' && (
                                <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">
                                    Uitgeschreven
                                </span>
                            )}
                            {member.invitation_status === 'pending' && tournament.status === 'preparation' && (
                                <button
                                    onClick={() => handleInvite(member.id)}
                                    disabled={processing[member.id]}
                                    className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50"
                                >
                                    Uitnodigen
                                </button>
                            )}
                            {tournament.status === 'registrations_open' && member.invitation_status === 'accepted' && member.registration_status !== 'registered' && (
                                <button
                                    onClick={() => handleRegister(member.id)}
                                    disabled={processing[member.id]}
                                    className="text-xs text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                                >
                                    Inschrijven
                                </button>
                            )}
                            {tournament.status === 'registrations_open' && member.registration_status === 'registered' && (
                                <button
                                    onClick={() => handleUnregister(member.id, member.name)}
                                    disabled={processing[member.id]}
                                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                                >
                                    Uitschrijven
                                </button>
                            )}
                            {tournament.status === 'preparation' && (
                                <button
                                    onClick={() => handleRemove(member.id, member.name)}
                                    className="text-xs text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                );

                return (
                    <>
                        <div className="divide-y divide-gray-200">
                            {participating.map(renderMember)}
                        </div>
                        {notParticipating.length > 0 && (
                            <>
                                <div className="px-4 py-2 bg-gray-100 border-t border-b border-gray-200">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Niet-deelnemers ({notParticipating.length})</span>
                                </div>
                                <div className="divide-y divide-gray-200 opacity-60">
                                    {notParticipating.map(renderMember)}
                                </div>
                            </>
                        )}
                    </>
                );
            })()}
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
        <form onSubmit={handleSubmit} className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {isEditing ? `Bewerk: ${tournament.name}` : 'Nieuw toernooi'}
            </h3>
            <div className="flex gap-6">
                {/* Left: form fields */}
                <div className="min-w-0 flex-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Naam *</label>
                            <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            {form.errors.name && <p className="text-xs text-red-600 mt-1">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Land *</label>
                            <select value={form.data.country_code} onChange={e => form.setData('country_code', e.target.value)}
                                className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Toernooidatum *</label>
                            <input type="date" value={form.data.tournament_date} onChange={e => form.setData('tournament_date', e.target.value)}
                                className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            {form.errors.tournament_date && <p className="text-xs text-red-600 mt-1">{form.errors.tournament_date}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Straat + nr</label>
                            <input type="text" value={form.data.address_street} onChange={e => form.setData('address_street', e.target.value)}
                                className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Postcode</label>
                            <input type="text" value={form.data.address_postal_code} onChange={e => form.setData('address_postal_code', e.target.value)}
                                className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Stad</label>
                            <input type="text" value={form.data.address_city} onChange={e => form.setData('address_city', e.target.value)}
                                onBlur={geocodeAddress}
                                className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Uitnodiging deadline</label>
                            <input type="date" value={form.data.invitation_deadline} onChange={e => form.setData('invitation_deadline', e.target.value)}
                                className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Inschrijving deadline</label>
                            <input type="date" value={form.data.registration_deadline} onChange={e => form.setData('registration_deadline', e.target.value)}
                                className="w-full rounded-md border border-gray-300 text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Bijlagen</label>
                            <input type="file" multiple onChange={e => form.setData('attachments', Array.from(e.target.files))}
                                className="w-full text-sm text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200" />
                            {form.errors.attachments && <p className="text-xs text-red-600 mt-1">{form.errors.attachments}</p>}
                        </div>
                    </div>

                    {/* Existing attachments (edit mode) */}
                    {isEditing && tournament.attachments && tournament.attachments.length > 0 && (
                        <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Bestaande bijlagen</label>
                            <div className="flex flex-wrap gap-2">
                                {tournament.attachments.map(att => (
                                    <span key={att.id} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${form.data.remove_attachment_ids.includes(att.id) ? 'bg-red-100 text-red-700 line-through' : 'bg-gray-100 text-gray-700'}`}>
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{att.original_name}</a>
                                        <button type="button" onClick={() => toggleRemoveAttachment(att.id)}
                                            className="ml-0.5 text-gray-500 hover:text-red-600">&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Age categories checkboxes */}
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Leeftijdscategorieën ({form.data.country_code})</label>
                        {filteredAgeCategories.length === 0 ? (
                            <p className="text-xs text-gray-400">Geen categorieën voor {form.data.country_code}</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {filteredAgeCategories.map(cat => (
                                    <label key={cat.id} className="flex items-center gap-1.5 text-sm text-gray-700">
                                        <input type="checkbox"
                                            checked={form.data.age_category_ids.includes(cat.id)}
                                            onChange={() => toggleAgeCategory(cat.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                        <label className="block text-xs font-medium text-gray-500 mb-1">Locatie</label>
                        <iframe
                            title="Locatie"
                            width="100%"
                            height="180"
                            className="rounded-md border border-gray-200"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.data.longitude - 0.01},${form.data.latitude - 0.01},${parseFloat(form.data.longitude) + 0.01},${parseFloat(form.data.latitude) + 0.01}&layer=mapnik&marker=${form.data.latitude},${form.data.longitude}`}
                        />
                        <p className="mt-1 text-center text-xs text-gray-400">
                            {form.data.address_city || 'Locatie'}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button type="submit" disabled={form.processing}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {isEditing ? 'Opslaan' : 'Toernooi aanmaken'}
                </button>
                <button type="button" onClick={onCancel}
                    className="rounded-md bg-white border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Annuleren
                </button>
            </div>
        </form>
    );
}
