import { Head, router } from '@inertiajs/react';
import { useMemo, useCallback } from 'react';
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

export default function Calendar({ items, startDate }) {
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
                                            return (
                                                <div
                                                    key={`${item.type}-${i}`}
                                                    className={`${style.bg} border-l-2 ${style.border} rounded-r px-1.5 py-0.5`}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-[10px] font-semibold ${style.text} truncate flex-1`}>
                                                            {item.name}
                                                        </span>
                                                        {item.participating && (
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
                </div>
            </div>
        </AppLayout>
    );
}
