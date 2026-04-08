import { useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import StageStepper from '../../Components/StageStepper';

export default function StagesSection({ stages, ageCategories, competitionMembers, statuses, availableCoaches, userRole }) {
    const { flash } = usePage().props;
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingStage, setEditingStage] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [flashStageId, setFlashStageId] = useState(null);

    const statusColors = {
        preparation: 'bg-slate-800 text-slate-300',
        invitations_sent: 'bg-blue-900/40 text-teal-300',
        registrations_open: 'bg-yellow-900/40 text-yellow-700',
        registrations_closed: 'bg-orange-100 text-orange-700',
        archived: 'bg-purple-900/40 text-purple-400',
    };

    return (
        <div>
            <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-teal-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                    Stages
                    <span className="ml-2 inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                        {stages.length}
                    </span>
                </h2>
                {userRole === 'admin' && (
                    <button
                        onClick={() => { setShowAddForm(!showAddForm); setEditingStage(null); }}
                        className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
                    >
                        {showAddForm ? 'Annuleren' : 'Stage toevoegen'}
                    </button>
                )}
            </div>



            {showAddForm && (
                <StageForm
                    ageCategories={ageCategories}
                    onSuccess={() => setShowAddForm(false)}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {editingStage && (
                <StageForm
                    stage={editingStage}
                    ageCategories={ageCategories}
                    onSuccess={() => setEditingStage(null)}
                    onCancel={() => setEditingStage(null)}
                />
            )}

            {stages.length === 0 ? (
                <div className="px-3 sm:px-6 py-8 text-center text-slate-500">
                    Nog geen stageen.
                </div>
            ) : (
                <div className="space-y-4 mt-4">
                    {stages.map((stage) => (
                        <StageRow
                            key={stage.id}
                            stage={stage}
                            statusColors={statusColors}
                            statuses={statuses}
                            competitionMembers={competitionMembers}
                            availableCoaches={availableCoaches}
                            isExpanded={expandedId === stage.id}
                            isEditing={editingStage?.id === stage.id}
                            onToggleExpand={() => setExpandedId(expandedId === stage.id ? null : stage.id)}
                            onEdit={() => { setEditingStage(stage); setShowAddForm(false); }}
                            flashMessage={flashStageId === stage.id ? flash.status : null}
                            onStepperTransition={() => setFlashStageId(stage.id)}
                            userRole={userRole}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function StageRow({ stage, statusColors, statuses, competitionMembers, availableCoaches, isExpanded, isEditing, onToggleExpand, onEdit, flashMessage, onStepperTransition, userRole }) {
    const deleteForm = useForm({});
    const statusLabel = statuses.find(s => s.value === stage.status)?.label || stage.status;
    const members = stage.stage_members || [];

    const handleDelete = () => {
        if (confirm(`Weet je zeker dat je "${stage.name}" wilt verwijderen?`)) {
            deleteForm.delete(`/admin/stages/${stage.id}`);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE');
    };

    const hasMap = stage.latitude && stage.longitude;

    return (
        <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-teal-700 px-6 py-4">
            <StageStepper status={stage.status} interactive={true} stageId={stage.id} onTransitionStart={onStepperTransition} userRole={userRole} />
            {flashMessage && (
                <div className="mb-3 rounded-md bg-emerald-900/30 border ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flashMessage}</p>
                </div>
            )}
            <div className="flex gap-6">
                {/* Left: details */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="min-w-0 flex-1">
                            <p className="font-medium text-white">{stage.name}</p>
                            <p className="text-sm text-slate-500">
                                {[stage.address_street, stage.address_postal_code, stage.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                                {' · '}{stage.country_code}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-teal-400 hover:text-teal-300 cursor-pointer" onClick={onToggleExpand}>
                                Deelnemers ({members.length}) {isExpanded ? '▲' : '▼'}
                            </span>
                            <button onClick={onEdit} className="text-sm text-teal-400 hover:text-teal-300">
                                Bewerken
                            </button>
                            {userRole === 'admin' && (
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteForm.processing}
                                    className="text-sm text-red-400 hover:text-red-800"
                                >
                                    Verwijderen
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs text-slate-500">
                        <span>Van: <strong>{formatDate(stage.start_date)}</strong></span>
                        <span>Tot: <strong>{formatDate(stage.end_date)}</strong></span>
                        <span>Uitnodiging deadline: <strong>{formatDate(stage.invitation_deadline)}</strong></span>
                        <span>Inschrijving deadline: <strong>{formatDate(stage.registration_deadline)}</strong></span>
                    </div>
                    {stage.age_categories && stage.age_categories.length > 0 && (
                        <div className="flex gap-1.5 mt-2">
                            {stage.age_categories.map(cat => (
                                <span key={cat.id} className="inline-flex items-center rounded-full bg-teal-900/30 px-2 py-0.5 text-xs font-medium text-teal-300">
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: map & attachments factbox (hidden when editing) */}
                {!isEditing && (hasMap || (stage.attachments && stage.attachments.length > 0)) && (
                    <div className="hidden sm:block shrink-0 w-56 space-y-3">
                        {hasMap && (
                            <div>
                                <iframe
                                    title="Locatie"
                                    width="100%"
                                    height="140"
                                    className="rounded-md border border-slate-700"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${stage.longitude - 0.01},${stage.latitude - 0.01},${parseFloat(stage.longitude) + 0.01},${parseFloat(stage.latitude) + 0.01}&layer=mapnik&marker=${stage.latitude},${stage.longitude}`}
                                />
                                <p className="mt-1 text-center text-xs text-slate-400">
                                    {stage.address_city || 'Locatie'}
                                </p>
                            </div>
                        )}
                        {stage.attachments && stage.attachments.length > 0 && (
                            <div className="rounded-md border border-slate-800 bg-slate-700/50 p-3">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Bijlagen</p>
                                <ul className="space-y-1">
                                    {stage.attachments.map(att => (
                                        <li key={att.id}>
                                            <a href={att.url} target="_blank" rel="noopener noreferrer"
                                                className="text-xs text-teal-400 hover:underline truncate block">
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
                <StageMembersPanel
                    stage={stage}
                    members={members}
                    competitionMembers={competitionMembers}
                    availableCoaches={availableCoaches}
                    userRole={userRole}
                />
            )}
        </div>
    );
}

function StageMembersPanel({ stage, members, competitionMembers, availableCoaches, userRole }) {
    const populateForm = useForm({});
    const inviteAllForm = useForm({});
    const addMemberForm = useForm({ member_id: '' });
    const addCoachForm = useForm({ member_id: '' });
    const [processing, setProcessing] = useState({});

    const invitationStatusColors = {
        pending: 'bg-slate-800 text-slate-400',
        invited: 'bg-blue-900/40 text-teal-300',
        accepted: 'bg-emerald-900/40 text-emerald-400',
        declined: 'bg-red-900/40 text-red-400',
    };

    const hasAgeCategories = stage.age_categories && stage.age_categories.length > 0;
    const existingMemberIds = members.map(m => m.id);
    const availableMembers = competitionMembers.filter(m => !existingMemberIds.includes(m.id));
    const pendingCount = members.filter(m => m.invitation_status === 'pending').length;

    const handlePopulate = () => {
        populateForm.post(`/admin/stages/${stage.id}/populate`);
    };

    const handleInviteAll = () => {
        if (confirm(`${pendingCount} uitnodigingen versturen?`)) {
            inviteAllForm.post(`/admin/stages/${stage.id}/invite-all`);
        }
    };



    const handleRegister = (memberId) => {
        setProcessing(prev => ({ ...prev, [memberId]: true }));
        router.post(`/admin/stages/${stage.id}/register/${memberId}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    const handleUnregister = (memberId, memberName) => {
        if (confirm(`${memberName} uitschrijven?`)) {
            setProcessing(prev => ({ ...prev, [memberId]: true }));
            router.post(`/admin/stages/${stage.id}/unregister/${memberId}`, {}, {
                preserveScroll: true,
                onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
            });
        }
    };



    const handleAddMember = (e) => {
        e.preventDefault();
        if (!addMemberForm.data.member_id) return;
        addMemberForm.post(`/admin/stages/${stage.id}/members`, {
            onSuccess: () => addMemberForm.reset(),
        });
    };

    const handleInvite = (memberId) => {
        setProcessing(prev => ({ ...prev, [memberId]: true }));
        router.post(`/admin/stages/${stage.id}/invite/${memberId}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    const handleRemove = (memberId, memberName) => {
        if (confirm(`${memberName} verwijderen van het stage?`)) {
            router.delete(`/admin/stages/${stage.id}/members/${memberId}`, {
                preserveScroll: true,
            });
        }
    };

    const coaches = stage.stage_coaches || [];
    const existingCoachIds = coaches.map(c => c.id);
    const filteredCoaches = availableCoaches.filter(c => !existingCoachIds.includes(c.id));

    const handleAddCoach = (e) => {
        e.preventDefault();
        if (!addCoachForm.data.member_id) return;
        addCoachForm.post(`/admin/stages/${stage.id}/coaches`, {
            onSuccess: () => addCoachForm.reset(),
        });
    };

    const handleRemoveCoach = (coachId, coachName) => {
        if (confirm(`${coachName} verwijderen als trainer?`)) {
            router.delete(`/admin/stages/${stage.id}/coaches/${coachId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleAdminAccept = (memberId) => {
        setProcessing(prev => ({ ...prev, [memberId]: true }));
        router.post(`/admin/stages/${stage.id}/accept/${memberId}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    const handleAdminDecline = (memberId) => {
        setProcessing(prev => ({ ...prev, [memberId]: true }));
        router.post(`/admin/stages/${stage.id}/decline/${memberId}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    const handleMarkPaid = (memberId) => {
        setProcessing(prev => ({ ...prev, [memberId]: true }));
        router.post(`/admin/stages/${stage.id}/mark-paid/${memberId}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    const handleCheckPayment = (memberId) => {
        setProcessing(prev => ({ ...prev, [memberId]: true }));
        router.post(`/admin/stages/${stage.id}/check-payment/${memberId}`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(prev => ({ ...prev, [memberId]: false })),
        });
    };

    const isPaidStage = Object.values(stage.age_category_fees || {}).some(f => f && parseFloat(f) > 0);

    return (
        <div className="mt-4 border border-slate-800 rounded-lg bg-slate-700/50">
            <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center gap-2">
                {stage.status === 'preparation' && userRole === 'coach' && (
                    <button
                        onClick={handlePopulate}
                        disabled={populateForm.processing || !hasAgeCategories}
                        title={!hasAgeCategories ? 'Voeg eerst leeftijdscategorieën toe' : ''}
                        className="rounded-md bg-teal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                    >
                        Deelnemers ophalen
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


                {/* Add individual member */}
                {stage.status === 'preparation' && userRole === 'coach' && (
                    <form onSubmit={handleAddMember} className="flex items-center gap-1 ml-auto">
                        <select
                            value={addMemberForm.data.member_id}
                            onChange={e => addMemberForm.setData('member_id', e.target.value)}
                            className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-xs py-1 px-2 max-w-full sm:max-w-[200px]"
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
                    Nog geen deelnemers. Klik op "Deelnemers ophalen" om competitieleden toe te voegen.
                </div>
            ) : (() => {
                const showSplit = stage.status !== 'preparation';
                const isRegClosed = ['registrations_closed'].includes(stage.status);

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
                        <td className="px-3 py-2 text-xs text-slate-400 whitespace-nowrap">{member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString('nl-BE') : '-'}</td>
                        <td className="px-3 py-2 text-xs text-slate-400 whitespace-nowrap">{member.license_number ? `#${member.license_number}` : '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                            {member.age_category ? (
                                <span className="inline-flex items-center rounded-full bg-teal-900/30 px-2 py-0.5 text-xs font-medium text-teal-300">
                                    {member.age_category}
                                </span>
                            ) : <span className="text-xs text-slate-300">-</span>}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                            {member.weight_category ? (
                                <span className="inline-flex items-center rounded-full bg-teal-900/30 px-2 py-0.5 text-xs font-medium text-teal-400">
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
                        {isPaidStage && (
                            <td className="px-3 py-2 whitespace-nowrap">
                                {member.payment_status === 'paid' ? (
                                    <span className="inline-flex items-center rounded-full bg-emerald-900/40 text-emerald-400 px-2 py-0.5 text-xs font-medium">
                                        💳 Betaald
                                    </span>
                                ) : member.payment_status === 'expired' ? (
                                    <span className="inline-flex items-center rounded-full bg-red-900/40 text-red-400 px-2 py-0.5 text-xs font-medium">
                                        Verlopen
                                    </span>
                                ) : member.payment_status === 'pending' ? (
                                    <span className="inline-flex items-center rounded-full bg-amber-900/40 text-amber-400 px-2 py-0.5 text-xs font-medium">
                                        In afwachting
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-500">—</span>
                                )}
                            </td>
                        )}
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                                {member.invitation_status === 'pending' && stage.status === 'preparation' && (
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
                                {stage.status === 'registrations_open' && member.invitation_status === 'accepted' && member.registration_status !== 'registered' && userRole === 'admin' && (
                                    <button
                                        onClick={() => handleRegister(member.id)}
                                        disabled={processing[member.id]}
                                        className="text-xs text-emerald-600 hover:text-emerald-400 disabled:opacity-50"
                                    >
                                        Inschrijven
                                    </button>
                                )}
                                {stage.status === 'registrations_open' && member.registration_status === 'registered' && userRole === 'admin' && (
                                    <button
                                        onClick={() => handleUnregister(member.id, member.name)}
                                        disabled={processing[member.id]}
                                        className="text-xs text-red-500 hover:text-red-400 disabled:opacity-50"
                                    >
                                        Uitschrijven
                                    </button>
                                )}
                                {stage.status === 'preparation' && userRole === 'coach' && (
                                    <button
                                        onClick={() => handleRemove(member.id, member.name)}
                                        className="text-xs text-red-500 hover:text-red-400"
                                    >
                                        ✕
                                    </button>
                                )}
                                {isPaidStage && member.payment_status && member.payment_status !== 'paid' && (
                                    <>
                                        <button
                                            onClick={() => handleMarkPaid(member.id)}
                                            disabled={processing[member.id]}
                                            className="text-xs text-emerald-600 hover:text-emerald-400 disabled:opacity-50"
                                            title="Markeer als betaald"
                                        >
                                            💳
                                        </button>
                                        <button
                                            onClick={() => handleCheckPayment(member.id)}
                                            disabled={processing[member.id]}
                                            className="text-xs text-blue-500 hover:text-blue-400 disabled:opacity-50"
                                            title="Status controleren"
                                        >
                                            🔄
                                        </button>
                                    </>
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
                            {isPaidStage && <th className="px-3 py-2">Betaling</th>}
                            <th className="px-3 py-2 text-right">Acties</th>
                        </tr>
                    </thead>
                );

                return (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                {tableHeader}
                                <tbody>
                                    {participating.map(renderMember)}
                                </tbody>
                            </table>
                        </div>
                        {notParticipating.length > 0 && (
                            <>
                                <div className="px-4 py-2 bg-slate-900 border-t border-b border-slate-800">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Niet-deelnemers ({notParticipating.length})</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full opacity-60">
                                        <tbody>
                                            {notParticipating.map(renderMember)}
                                        </tbody>
                                    </table>
                                </div>
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
                    {userRole === 'admin' && (
                        <form onSubmit={handleAddCoach} className="flex items-center gap-1">
                            <select
                                value={addCoachForm.data.member_id}
                                onChange={e => addCoachForm.setData('member_id', e.target.value)}
                                className="rounded-md border border-slate-600 bg-slate-700/50 text-white text-xs py-1 px-2 max-w-full sm:max-w-[200px]"
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
                    )}
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
                                {userRole === 'admin' && (
                                    <button
                                        onClick={() => handleRemoveCoach(coach.id, coach.name)}
                                        className="text-xs text-red-500 hover:text-red-400"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StageForm({ stage, ageCategories, onSuccess, onCancel }) {
    const isEditing = !!stage;
    const form = useForm({
        name: stage?.name || '',
        address_street: stage?.address_street || '',
        address_city: stage?.address_city || '',
        address_postal_code: stage?.address_postal_code || '',
        country_code: stage?.country_code || 'BE',
        latitude: stage?.latitude || '',
        longitude: stage?.longitude || '',
        start_date: stage?.start_date ? stage.start_date.split('T')[0] : '',
        end_date: stage?.end_date ? stage.end_date.split('T')[0] : '',
        invitation_deadline: stage?.invitation_deadline ? stage.invitation_deadline.split('T')[0] : '',
        registration_deadline: stage?.registration_deadline ? stage.registration_deadline.split('T')[0] : '',
        age_category_ids: stage?.age_category_ids || [],
        age_category_fees: stage?.age_category_fees || {},
        attachments: [],
        remove_attachment_ids: [],
    });

    const countries = [...new Set(ageCategories.map(c => c.country_code))].sort();
    const filteredAgeCategories = ageCategories.filter(c => c.country_code === form.data.country_code);

    const toggleAgeCategory = (id) => {
        const current = form.data.age_category_ids;
        if (current.includes(id)) {
            form.setData(prev => {
                const fees = { ...prev.age_category_fees };
                delete fees[id];
                return { ...prev, age_category_ids: current.filter(x => x !== id), age_category_fees: fees };
            });
        } else {
            form.setData('age_category_ids', [...current, id]);
        }
    };

    const setAgeCategoryFee = (id, value) => {
        form.setData('age_category_fees', { ...form.data.age_category_fees, [id]: value === '' ? null : parseFloat(value) });
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
            form.post(`/admin/stages/${stage.id}`, {
                onSuccess,
                forceFormData: true,
            });
        } else {
            form.post('/admin/stages', {
                onSuccess: () => { form.reset(); onSuccess(); },
                forceFormData: true,
            });
        }
    };

    const hasMap = form.data.latitude && form.data.longitude;

    return (
        <form onSubmit={handleSubmit} className="px-3 sm:px-6 py-4 bg-slate-700/50 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">
                {isEditing ? `Bewerk: ${stage.name}` : 'Nieuw stage'}
            </h3>
            <div className="flex gap-6">
                {/* Left: form fields */}
                <div className="min-w-0 flex-1">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Naam *</label>
                            <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                            {form.errors.name && <p className="text-xs text-red-400 mt-1">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Land *</label>
                            <select value={form.data.country_code} onChange={e => form.setData('country_code', e.target.value)}
                                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Straat + nr</label>
                            <input type="text" value={form.data.address_street} onChange={e => form.setData('address_street', e.target.value)}
                                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Postcode</label>
                            <input type="text" value={form.data.address_postal_code} onChange={e => form.setData('address_postal_code', e.target.value)}
                                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Stad</label>
                            <input type="text" value={form.data.address_city} onChange={e => form.setData('address_city', e.target.value)}
                                onBlur={geocodeAddress}
                                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                    </div>

                    {/* Datums block */}
                    <div className="mb-3 rounded-lg border border-slate-800 bg-slate-800/50 p-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Datums</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Uitnodiging deadline *</label>
                                <input type="date" value={form.data.invitation_deadline} onChange={e => form.setData('invitation_deadline', e.target.value)}
                                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                {form.errors.invitation_deadline && <p className="text-xs text-red-400 mt-1">{form.errors.invitation_deadline}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Inschrijving deadline *</label>
                                <input type="date" value={form.data.registration_deadline} onChange={e => form.setData('registration_deadline', e.target.value)}
                                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                {form.errors.registration_deadline && <p className="text-xs text-red-400 mt-1">{form.errors.registration_deadline}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Startdatum *</label>
                                <input type="date" value={form.data.start_date} onChange={e => form.setData('start_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                {form.errors.start_date && <p className="text-xs text-red-400 mt-1">{form.errors.start_date}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Einddatum *</label>
                                <input type="date" value={form.data.end_date} onChange={e => form.setData('end_date', e.target.value)}
                                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                {form.errors.end_date && <p className="text-xs text-red-400 mt-1">{form.errors.end_date}</p>}
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Uitnodiging deadline &lt; Inschrijving deadline &lt; Startdatum</p>
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
                    {isEditing && stage.attachments && stage.attachments.length > 0 && (
                        <div className="mb-3">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Bestaande bijlagen</label>
                            <div className="flex flex-wrap gap-2">
                                {stage.attachments.map(att => (
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
                                    <div key={cat.id} className="flex items-center gap-1.5">
                                        <label className="flex items-center gap-1.5 text-sm text-slate-300">
                                            <input type="checkbox"
                                                checked={form.data.age_category_ids.includes(cat.id)}
                                                onChange={() => toggleAgeCategory(cat.id)}
                                                className="rounded border-slate-600 bg-slate-700 text-teal-400 focus:ring-teal-500" />
                                            {cat.name} ({cat.min_age}–{cat.max_age})
                                        </label>
                                        {form.data.age_category_ids.includes(cat.id) && (
                                            <div className="flex items-center gap-0.5">
                                                <span className="text-xs text-slate-400">€</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0"
                                                    value={form.data.age_category_fees[cat.id] ?? ''}
                                                    onChange={e => setAgeCategoryFee(cat.id, e.target.value)}
                                                    className="w-16 rounded-md border border-slate-600 bg-slate-700/50 text-white text-xs py-1 px-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                />
                                            </div>
                                        )}
                                    </div>
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
                    className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
                    {isEditing ? 'Opslaan' : 'Stage aanmaken'}
                </button>
                <button type="button" onClick={onCancel}
                    className="rounded-md bg-slate-700/50 border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700/50">
                    Annuleren
                </button>
            </div>
        </form>
    );
}
