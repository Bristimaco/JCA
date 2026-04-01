import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useCallback, useState } from 'react';
import AppLayout from '../Layouts/AppLayout';

const DAY_LABELS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const MONTH_NAMES = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

const TYPE_STYLES = {
    training: { bg: 'bg-amber-900/40', border: 'border-l-amber-500', text: 'text-amber-300', label: 'Training' },
    tournament: { bg: 'bg-rose-900/40', border: 'border-l-rose-500', text: 'text-rose-300', label: 'Toernooi' },
    event: { bg: 'bg-blue-900/40', border: 'border-l-blue-500', text: 'text-blue-300', label: 'Evenement' },
};

function toDateString(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return toDateString(d);
}

function formatDateRange(startDate) {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(addDays(startDate, 27) + 'T00:00:00');
    const sm = MONTH_NAMES[start.getMonth()];
    const em = MONTH_NAMES[end.getMonth()];
    if (start.getFullYear() !== end.getFullYear()) {
        return `${start.getDate()} ${sm} ${start.getFullYear()} — ${end.getDate()} ${em} ${end.getFullYear()}`;
    }
    if (sm === em) {
        return `${start.getDate()} — ${end.getDate()} ${sm} ${start.getFullYear()}`;
    }
    return `${start.getDate()} ${sm} — ${end.getDate()} ${em} ${start.getFullYear()}`;
}

function isToday(dateStr) {
    return dateStr === toDateString(new Date());
}

export default function Calendar({ items, startDate, myMemberIds }) {
    const [absenceModal, setAbsenceModal] = useState(null);
    const [absenceReason, setAbsenceReason] = useState('');
    const [absenceSubmitting, setAbsenceSubmitting] = useState(false);
    const [localAbsentMap, setLocalAbsentMap] = useState({});

    const todayStr = toDateString(new Date());

    const weeks = useMemo(() => {
        const itemsByDate = {};
        items.forEach((item) => {
            (itemsByDate[item.date] ||= []).push(item);
        });

        const result = [];
        for (let w = 0; w < 4; w++) {
            const days = [];
            for (let d = 0; d < 7; d++) {
                const date = addDays(startDate, w * 7 + d);
                days.push({ date, items: itemsByDate[date] || [] });
            }
            result.push(days);
        }
        return result;
    }, [items, startDate]);

    const navigate = useCallback((direction) => {
        const newStart = addDays(startDate, direction * 7);
        router.get('/kalender', { start: newStart }, { preserveState: true, preserveScroll: true });
    }, [startDate]);

    const goToToday = useCallback(() => {
        router.get('/kalender', {}, { preserveState: true, preserveScroll: true });
    }, []);

    return (
        <AppLayout fullWidth>
            <Head title="Kalender" />

            <div className="flex flex-col flex-1 min-h-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-1 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Kalender</h1>
                        <p className="text-sm text-slate-400">{formatDateRange(startDate)}</p>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4">
                        {Object.entries(TYPE_STYLES).map(([type, style]) => (
                            <div key={type} className="flex items-center gap-1.5">
                                <div className={`w-2.5 h-2.5 rounded-sm ${style.bg} border-l-2 ${style.border}`} />
                                <span className="text-xs text-slate-400">{style.label}</span>
                            </div>
                        ))}
                        <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center rounded bg-emerald-900/60 px-1 py-px text-[8px] font-bold text-emerald-400">✓</span>
                            <span className="text-xs text-slate-400">Deelname</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center rounded bg-amber-900/60 px-1 py-px text-[8px] font-bold text-amber-400">1/2</span>
                            <span className="text-xs text-slate-400">Deels afwezig</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center rounded bg-red-900/60 px-1 py-px text-[8px] font-bold text-red-400">✗</span>
                            <span className="text-xs text-slate-400">Afwezig gemeld</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700"
                        >
                            ← Vorige
                        </button>
                        <button
                            onClick={goToToday}
                            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700"
                        >
                            Vandaag
                        </button>
                        <button
                            onClick={() => navigate(1)}
                            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700"
                        >
                            Volgende →
                        </button>
                    </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-px bg-slate-800 rounded-t-xl overflow-hidden shrink-0">
                    {DAY_LABELS.map((d) => (
                        <div key={d} className="bg-slate-900 py-1 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Week rows */}
                <div className="grid grid-rows-4 gap-px bg-slate-800 rounded-b-xl overflow-hidden flex-1 min-h-0">
                    {weeks.map((week, wi) => (
                        <div key={wi} className="grid grid-cols-7 gap-px min-h-0">
                            {week.map((day) => (
                                <div
                                    key={day.date}
                                    className={`bg-slate-900 p-1.5 flex flex-col min-h-0 overflow-hidden ${isToday(day.date) ? 'ring-1 ring-inset ring-rose-500/50' : ''}`}
                                >
                                    <span className={`text-xs font-medium mb-1 shrink-0 ${isToday(day.date) ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                                        {parseInt(day.date.slice(8))}
                                    </span>
                                    <div className="flex-1 overflow-y-auto space-y-px min-h-0 scrollbar-thin">
                                        {day.items.map((item, i) => {
                                            const style = TYPE_STYLES[item.type];
                                            const absentIds = item.absent_members ? item.absent_members.map(m => m.id) : [];
                                            const participatingMembers = item.participating_members || [];
                                            const absentCount = participatingMembers.filter(m => absentIds.includes(m.id)).length;
                                            const allAbsent = participatingMembers.length > 0 && absentCount === participatingMembers.length;
                                            const someAbsent = absentCount > 0 && !allAbsent;
                                            const canReportAbsence = item.type === 'training' && item.participating && item.date >= todayStr;
                                            return (
                                                <div
                                                    key={`${item.type}-${i}`}
                                                    className={`${style.bg} border-l-2 ${style.border} rounded-r px-1.5 py-0.5 ${canReportAbsence ? 'cursor-pointer hover:ring-1 hover:ring-slate-500' : ''}`}
                                                    onClick={canReportAbsence ? () => {
                                                        setAbsenceModal(item);
                                                        const map = {};
                                                        if (item.absent_members) {
                                                            item.absent_members.forEach(m => { map[m.id] = m.reason || null; });
                                                        }
                                                        setLocalAbsentMap(map);
                                                        setAbsenceReason('');
                                                    } : undefined}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-[10px] font-semibold ${style.text} truncate flex-1`}>
                                                            {item.name}
                                                        </span>
                                                        {(item.type === 'tournament' || item.type === 'event') && (
                                                            <Link
                                                                href={item.type === 'tournament' ? `/toernooien/${item.id}` : '/evenementen'}
                                                                className="shrink-0 text-[10px] text-slate-400 hover:text-white"
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                ↗
                                                            </Link>
                                                        )}
                                                        {allAbsent && (
                                                            <span className="shrink-0 inline-flex items-center rounded bg-red-900/60 px-1 py-px text-[8px] font-bold text-red-400">
                                                                ✗
                                                            </span>
                                                        )}
                                                        {someAbsent && (
                                                            <span className="shrink-0 inline-flex items-center rounded bg-amber-900/60 px-1 py-px text-[8px] font-bold text-amber-400">
                                                                {absentCount}/{participatingMembers.length}
                                                            </span>
                                                        )}
                                                        {!allAbsent && !someAbsent && item.participating && (
                                                            <span className="shrink-0 inline-flex items-center rounded bg-emerald-900/60 px-1 py-px text-[8px] font-bold text-emerald-400">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                                                        {item.start_time && (
                                                            <span>{item.start_time}{item.end_time ? `–${item.end_time}` : ''}</span>
                                                        )}
                                                        {item.time && !item.start_time && (
                                                            <span>{item.time}</span>
                                                        )}
                                                        {participatingMembers.length > 0 && (
                                                            <span className="text-slate-400 truncate">{participatingMembers.map(m => m.first_name).join(', ')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>


            </div>

            {/* Absence modal */}
            {absenceModal && (() => {
                const participatingMembers = absenceModal.participating_members || [];
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

                const closeModal = () => {
                    setAbsenceModal(null);
                    router.reload();
                };

                const submitAbsence = (memberId) => {
                    const reason = absenceReason || null;
                    setLocalAbsentMap(prev => ({ ...prev, [memberId]: reason }));
                    setAbsenceSubmitting(true);
                    fetch('/training-absences', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                        body: JSON.stringify({ member_id: memberId, training_schedule_id: absenceModal.training_schedule_id, date: absenceModal.date, reason }),
                    }).then(() => {
                        setAbsenceSubmitting(false);
                    }).catch(() => setAbsenceSubmitting(false));
                };

                const cancelAbsence = (memberId) => {
                    setLocalAbsentMap(prev => {
                        const next = { ...prev };
                        delete next[memberId];
                        return next;
                    });
                    setAbsenceSubmitting(true);
                    fetch('/training-absences', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                        body: JSON.stringify({ member_id: memberId, training_schedule_id: absenceModal.training_schedule_id, date: absenceModal.date }),
                    }).then(() => {
                        setAbsenceSubmitting(false);
                    }).catch(() => setAbsenceSubmitting(false));
                };

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeModal}>
                        <div className="bg-slate-900 rounded-xl ring-1 ring-slate-700 p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-bold text-white mb-1">{absenceModal.name}</h3>
                            <p className="text-sm text-slate-400 mb-4">
                                {absenceModal.date} · {absenceModal.start_time}{absenceModal.end_time ? `–${absenceModal.end_time}` : ''}
                            </p>

                            {participatingMembers.length === 0 && (
                                <p className="text-sm text-slate-500 mb-4">Geen van je leden neemt deel aan deze training.</p>
                            )}

                            {participatingMembers.length === 1 && (() => {
                                const member = participatingMembers[0];
                                const isAbsent = member.id in localAbsentMap;
                                return isAbsent ? (
                                    <>
                                        <p className="text-sm text-red-400 mb-4">
                                            {member.first_name} is afwezig gemeld voor deze training.
                                            {localAbsentMap[member.id] && <span className="block text-slate-400 italic mt-1">Reden: {localAbsentMap[member.id]}</span>}
                                        </p>
                                        <div className="flex gap-3">
                                            <button disabled={absenceSubmitting} onClick={() => cancelAbsence(member.id)}
                                                className="flex-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                                            >Afwezigheid annuleren</button>
                                            <button onClick={closeModal} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700">Sluiten</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Reden (optioneel)</label>
                                        <input type="text" value={absenceReason} onChange={e => setAbsenceReason(e.target.value)} maxLength={255}
                                            placeholder="Bijv. ziek, vakantie..." className="w-full rounded-md border border-slate-600 bg-slate-800 text-white text-sm py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                                        <div className="flex gap-3">
                                            <button disabled={absenceSubmitting} onClick={() => submitAbsence(member.id)}
                                                className="flex-1 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                                            >Afwezig melden</button>
                                            <button onClick={closeModal} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700">Annuleren</button>
                                        </div>
                                    </>
                                );
                            })()}

                            {participatingMembers.length > 1 && (
                                <>
                                    <div className="space-y-2 mb-4">
                                        {participatingMembers.map(member => {
                                            const isAbsent = member.id in localAbsentMap;
                                            return (
                                                <div key={member.id} className={`flex items-center justify-between rounded-lg p-3 ${isAbsent ? 'bg-red-900/20 ring-1 ring-red-800/40' : 'bg-slate-800/50 ring-1 ring-slate-700/40'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isAbsent ? 'bg-red-900/40 text-red-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                                                            {isAbsent ? '✗' : '✓'}
                                                        </div>
                                                        <span className="text-sm font-medium text-white">{member.first_name}</span>
                                                        {isAbsent && localAbsentMap[member.id] && (
                                                            <span className="text-[10px] text-slate-400 italic">({localAbsentMap[member.id]})</span>
                                                        )}
                                                        {isAbsent && <span className="text-[10px] text-red-400 font-semibold">Afwezig</span>}
                                                    </div>
                                                    <button
                                                        disabled={absenceSubmitting}
                                                        onClick={() => isAbsent ? cancelAbsence(member.id) : submitAbsence(member.id)}
                                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                                                            isAbsent
                                                                ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                                                                : 'bg-red-700 text-white hover:bg-red-600'
                                                        }`}
                                                    >
                                                        {isAbsent ? 'Heractiveren' : 'Afwezig'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {participatingMembers.some(m => !(m.id in localAbsentMap)) && (
                                        <>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Reden (optioneel)</label>
                                            <input type="text" value={absenceReason} onChange={e => setAbsenceReason(e.target.value)} maxLength={255}
                                                placeholder="Bijv. ziek, vakantie..." className="w-full rounded-md border border-slate-600 bg-slate-800 text-white text-sm py-2 px-3 mb-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
                                        </>
                                    )}

                                    <button onClick={closeModal} className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700">
                                        Sluiten
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                );
            })()}
        </AppLayout>
    );
}
