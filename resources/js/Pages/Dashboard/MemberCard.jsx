export default function MemberCard({ member, ageCategories }) {
    const genderLabel = member.gender === 'male' ? 'Man' : 'Vrouw';
    const statusLabels = { active: 'Actief', inactive: 'Inactief', suspended: 'Geschorst', pending: 'In afwachting' };
    const statusColors = { active: 'bg-emerald-500', inactive: 'bg-slate-400', suspended: 'bg-red-500', pending: 'bg-amber-500' };

    const birthDate = member.date_of_birth ? new Date(member.date_of_birth) : null;
    const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : null;

    const ageCat = age !== null
        ? ageCategories.find((c) => c.country_code === 'BE' && age >= c.min_age && age <= c.max_age)
        : null;

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-slate-800 rounded-2xl shadow-lg ring-1 ring-slate-700/60 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <p className="text-amber-200 text-xs font-semibold uppercase tracking-wider">柔道 Judo Club</p>
                        <p className="text-white text-lg font-bold">Lidkaart</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${statusColors[member.membership_status] || 'bg-slate-400'} ring-2 ring-white/30`}
                        title={statusLabels[member.membership_status]} />
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex gap-5">
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-white truncate">
                                {member.first_name} {member.last_name}
                            </h3>

                            {member.license_number && (
                                <p className="text-sm text-slate-400 mt-0.5">
                                    Licentie: <span className="font-mono font-semibold text-slate-200">{member.license_number}</span>
                                </p>
                            )}

                            <div className="mt-3 space-y-1 text-sm text-slate-400">
                                <p>
                                    <span className="text-slate-500 w-20 inline-block">Geboren:</span>
                                    {birthDate ? birthDate.toLocaleDateString('nl-BE') : '-'}
                                </p>
                                <p>
                                    <span className="text-slate-400 w-20 inline-block">Geslacht:</span>
                                    {genderLabel}
                                </p>
                                <p>
                                    <span className="text-slate-500 w-20 inline-block">Categorie:</span>
                                    {ageCat ? ageCat.name : '-'}
                                </p>
                                <p>
                                    <span className="text-slate-500 w-20 inline-block">Gordel:</span>
                                    {member.current_belt_label || '-'}
                                </p>
                                <p>
                                    <span className="text-slate-500 w-20 inline-block">Gewicht:</span>
                                    {member.weight_category_name || '-'}
                                </p>
                            </div>
                        </div>

                        {/* Photo */}
                        <div className="flex-shrink-0">
                            {member.photo_url ? (
                                <img src={member.photo_url} alt="" className="w-24 h-28 rounded-xl object-cover ring-1 ring-slate-600/60 shadow-sm" />
                            ) : (
                                <div className="w-24 h-28 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                                    <span className="text-2xl font-bold text-white">
                                        {member.first_name[0]}{member.last_name[0]}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-3 text-sm text-slate-400">
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
                    <div className="mt-4 pt-3 border-t border-slate-700 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${member.membership_status === 'active' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-700 text-slate-300'
                            }`}>
                            {statusLabels[member.membership_status]}
                        </span>
                        {member.is_competition && (
                            <span className="inline-flex items-center rounded-full bg-amber-900/40 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                                Competitie
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
