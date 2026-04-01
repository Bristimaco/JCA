import { Head, router, usePage } from '@inertiajs/react';
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
        <AppLayout>
            <Head title="Kalender" />

            <div className="flex flex-col h-[calc(100vh-5rem)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Kalender</h1>
                        <p className="text-sm text-slate-400">{formatDateRange(startDate)}</p>
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
                        <div key={d} className="bg-slate-900 py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
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
                                    <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0 scrollbar-thin">
                                        {day.items.map((item, i) => {
                                            const style = TYPE_STYLES[item.type];
                                            const isAbsent = item.type === 'training' && item.absent_member_ids && myMemberIds.some(id => item.absent_member_ids.includes(id));
                                            const canReportAbsence = item.type === 'training' && item.participating && item.date >= todayStr;
                                            return (
                                                <div
                                                    key={`${item.type}-${i}`}
                                                    className={`${style.bg} border-l-2 ${style.border} rounded-r px-1.5 py-0.5 ${canReportAbsence ? 'cursor-pointer hover:ring-1 hover:ring-slate-500' : ''}`}
                                                    onClick={canReportAbsence ? () => {
                                                        setAbsenceModal(item);
                                                        setAbsenceReason('');
                                                    } : undefined}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-[10px] font-semibold ${style.text} truncate flex-1`}>
                                                            {item.name}
                                                        </span>
                                                        {isAbsent && (
                                                            <span className="shrink-0 inline-flex items-center rounded bg-red-900/60 px-1 py-px text-[8px] font-bold text-red-400">
                                                                ✗
                                                            </span>
                                                        )}
                                                        {!isAbsent && item.participating && (
                                                            <span className="shrink-0 inline-flex items-center rounded bg-emerald-900/60 px-1 py-px text-[8px] font-bold text-emerald-400">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.start_time && (
                                                        <span className="text-[9px] text-slate-500">
                                                            {item.start_time}{item.end_time ? `–${item.end_time}` : ''}
                                                        </span>
                                                    )}
                                                    {item.time && !item.start_time && (
                                                        <span className="text-[9px] text-slate-500">{item.time}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-2 shrink-0">
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
                        <span className="inline-flex items-center rounded bg-red-900/60 px-1 py-px text-[8px] font-bold text-red-400">✗</span>
                        <span className="text-xs text-slate-400">Afwezig gemeld</span>
                    </div>
                </div>
            </div>

            {/* Absence modal */}
            {absenceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setAbsenceModal(null)}>
                    <div className="bg-slate-900 rounded-xl ring-1 ring-slate-700 p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                        {(() => {
                            const isAlreadyAbsent = absenceModal.absent_member_ids && myMemberIds.some(id => absenceModal.absent_member_ids.includes(id));
                            return (
                                <>
                                    <h3 className="text-lg font-bold text-white mb-1">{absenceModal.name}</h3>
                                    <p className="text-sm text-slate-400 mb-4">
                                        {absenceModal.date} · {absenceModal.start_time}{absenceModal.end_time ? `–${absenceModal.end_time}` : ''}
                                    </p>

                                    {isAlreadyAbsent ? (
                                        <>
                                            <p className="text-sm text-red-400 mb-4">Je hebt je afwezig gemeld voor deze training.</p>
                                            <div className="flex gap-3">
                                                <button
                                                    disabled={absenceSubmitting}
                                                    onClick={() => {
                                                        setAbsenceSubmitting(true);
                                                        fetch('/training-absences', {
                                                            method: 'DELETE',
                                                            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
                                                            body: JSON.stringify({ training_schedule_id: absenceModal.training_schedule_id, date: absenceModal.date }),
                                                        }).then(() => {
                                                            setAbsenceSubmitting(false);
                                                            setAbsenceModal(null);
                                                            router.reload();
                                                        }).catch(() => setAbsenceSubmitting(false));
                                                    }}
                                                    className="flex-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                                                >
                                                    Afwezigheid annuleren
                                                </button>
                                                <button onClick={() => setAbsenceModal(null)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700">
                                                    Sluiten
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Reden (optioneel)</label>
                                            <input
                                                type="text"
                                                value={absenceReason}
                                                onChange={e => setAbsenceReason(e.target.value)}
                                                maxLength={255}
                                                placeholder="Bijv. ziek, vakantie..."
                                                className="w-full rounded-md border border-slate-600 bg-slate-800 text-white text-sm py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    disabled={absenceSubmitting}
                                                    onClick={() => {
                                                        setAbsenceSubmitting(true);
                                                        fetch('/training-absences', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
                                                            body: JSON.stringify({ training_schedule_id: absenceModal.training_schedule_id, date: absenceModal.date, reason: absenceReason || null }),
                                                        }).then(() => {
                                                            setAbsenceSubmitting(false);
                                                            setAbsenceModal(null);
                                                            router.reload();
                                                        }).catch(() => setAbsenceSubmitting(false));
                                                    }}
                                                    className="flex-1 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                                                >
                                                    Afwezig melden
                                                </button>
                                                <button onClick={() => setAbsenceModal(null)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700">
                                                    Annuleren
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
