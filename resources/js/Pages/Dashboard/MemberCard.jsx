import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function MemberCard({ member, ageCategories, showPaidButton = false }) {
    const paidForm = useForm({});
    const [showAttendance, setShowAttendance] = useState(false);
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
            <div className="bg-slate-900 rounded-2xl shadow-lg ring-1 ring-slate-800 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 to-yellow-700 px-6 py-4 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute inset-0 seigaiha opacity-20"></div>
                    <div className="relative z-10">
                        <p className="text-amber-200 text-xs font-semibold uppercase tracking-wider">柔道 Judo Club</p>
                        <p className="text-white text-lg font-bold">Lidkaart</p>
                    </div>
                    <div className={`relative z-10 w-3 h-3 rounded-full ${statusColors[member.membership_status] || 'bg-slate-400'} ring-2 ring-white/30`}
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
                                {member.membership_renewal_date && (
                                    <p>
                                        <span className="text-slate-500 w-20 inline-block">Vernieuwing:</span>
                                        <span className={(() => {
                                            const d = new Date(member.membership_renewal_date);
                                            const days = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
                                            if (days < 0) return 'text-red-400 font-semibold';
                                            if (days <= 30) return 'text-amber-400';
                                            return '';
                                        })()}>
                                            {new Date(member.membership_renewal_date).toLocaleDateString('nl-BE')}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Photo */}
                        <div className="flex-shrink-0">
                            {member.photo_url ? (
                                <img src={member.photo_url} alt="" className="w-24 h-28 rounded-xl object-cover ring-1 ring-slate-600/60 shadow-sm" />
                            ) : (
                                <div className="w-24 h-28 rounded-xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center shadow-sm">
                                    <span className="text-2xl font-bold text-white">
                                        {member.first_name[0]}{member.last_name[0]}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-sm text-slate-400">
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
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${member.membership_status === 'active' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-700 text-slate-300'
                            }`}>
                            {statusLabels[member.membership_status]}
                        </span>
                        {member.is_competition && (
                            <span className="inline-flex items-center rounded-full bg-rose-900/40 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                                Competitie
                            </span>
                        )}
                        {showPaidButton && (
                            <button
                                onClick={() => {
                                    if (confirm(`Lidgeld voor "${member.first_name} ${member.last_name}" markeren als betaald?`)) {
                                        paidForm.post(`/admin/members/${member.id}/mark-paid`);
                                    }
                                }}
                                disabled={paidForm.processing}
                                className="inline-flex items-center rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-800/60 disabled:opacity-50 cursor-pointer"
                            >
                                Betaald
                            </button>
                        )}
                    </div>

                    {/* Attendance History */}
                    {member.attendance_count > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-800">
                            <button
                                onClick={() => setShowAttendance(!showAttendance)}
                                className="flex items-center gap-2 text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors"
                            >
                                <span className="inline-flex items-center justify-center rounded-full bg-rose-900/40 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                                    {member.attendance_count}
                                </span>
                                {member.attendance_count === 1 ? 'training' : 'trainingen'}
                                <span className="text-xs text-slate-500">{showAttendance ? '▲' : '▼'}</span>
                            </button>
                            {showAttendance && member.attendance_history && (
                                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                                    {member.attendance_history.map((a, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">{a.group_name}</span>
                                            <span className="text-slate-500">{new Date(a.date).toLocaleDateString('nl-BE')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
