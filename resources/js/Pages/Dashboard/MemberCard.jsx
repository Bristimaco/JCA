export default function MemberCard({ member, ageCategories }) {
    const genderLabel = member.gender === 'male' ? 'Man' : 'Vrouw';
    const statusLabels = { active: 'Actief', inactive: 'Inactief', suspended: 'Geschorst', pending: 'In afwachting' };
    const statusColors = { active: 'bg-green-500', inactive: 'bg-gray-400', suspended: 'bg-red-500', pending: 'bg-yellow-500' };

    const birthDate = member.date_of_birth ? new Date(member.date_of_birth) : null;
    const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : null;

    const ageCat = age !== null
        ? ageCategories.find((c) => c.country_code === 'BE' && age >= c.min_age && age <= c.max_age)
        : null;

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-white text-xs font-medium uppercase tracking-wider">Judo Club</p>
                        <p className="text-white text-lg font-bold">Lidkaart</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${statusColors[member.membership_status] || 'bg-gray-400'}`}
                        title={statusLabels[member.membership_status]} />
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex gap-5">
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 truncate">
                                {member.first_name} {member.last_name}
                            </h3>

                            {member.license_number && (
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Licentie: <span className="font-mono font-medium text-gray-700">{member.license_number}</span>
                                </p>
                            )}

                            <div className="mt-3 space-y-1 text-sm text-gray-600">
                                <p>
                                    <span className="text-gray-400 w-20 inline-block">Geboren:</span>
                                    {birthDate ? birthDate.toLocaleDateString('nl-BE') : '-'}
                                </p>
                                <p>
                                    <span className="text-gray-400 w-20 inline-block">Geslacht:</span>
                                    {genderLabel}
                                </p>
                                <p>
                                    <span className="text-gray-400 w-20 inline-block">Categorie:</span>
                                    {ageCat ? ageCat.name : '-'}
                                </p>
                                <p>
                                    <span className="text-gray-400 w-20 inline-block">Gordel:</span>
                                    {member.current_belt_label || '-'}
                                </p>
                                <p>
                                    <span className="text-gray-400 w-20 inline-block">Gewicht:</span>
                                    {member.weight_category_name || '-'}
                                </p>
                            </div>
                        </div>

                        {/* Photo */}
                        <div className="flex-shrink-0">
                            {member.photo_url ? (
                                <img src={member.photo_url} alt="" className="w-24 h-28 rounded-lg object-cover border border-gray-200" />
                            ) : (
                                <div className="w-24 h-28 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-400">
                                        {member.first_name[0]}{member.last_name[0]}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>
                            {member.email && (
                                <p className="truncate">{member.email}</p>
                            )}
                            {member.phone && (
                                <p>{member.phone}</p>
                            )}
                        </div>
                        <div className="text-right">
                            {member.address_street && <p>{member.address_street}</p>}
                            {(member.address_postal_code || member.address_city) && (
                                <p>{[member.address_postal_code, member.address_city].filter(Boolean).join(' ')}</p>
                            )}
                        </div>
                    </div>

                    {/* Footer badges */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${member.membership_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {statusLabels[member.membership_status]}
                        </span>
                        {member.is_competition && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                Competitie
                            </span>
                        )}
                    </div>

                    {/* Competition History */}
                    {member.is_competition && member.tournament_results && member.tournament_results.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Competitie Historiek</h4>
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                                {member.tournament_results.map((r) => (
                                    <div key={r.id} className="rounded-md border border-gray-100 bg-gray-50 p-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-gray-700 truncate">{r.tournament_name}</p>
                                                <p className="text-xs text-gray-400">{new Date(r.tournament_date).toLocaleDateString('nl-BE')}</p>
                                            </div>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${r.result.includes('1e') ? 'bg-yellow-100 text-yellow-800' :
                                                    r.result.includes('2e') ? 'bg-gray-200 text-gray-700' :
                                                        r.result.includes('3e') ? 'bg-amber-100 text-amber-800' :
                                                            'bg-gray-100 text-gray-600'
                                                }`}>
                                                {r.result}
                                            </span>
                                        </div>
                                        {r.notes && (
                                            <p className="text-xs text-gray-500 mt-1 break-words">{r.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
