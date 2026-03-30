import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';

const SLIDE_DURATION = 15000;

const resultBadge = (result) => {
    if (!result) return null;
    const styles = {
        '1e plaats': 'bg-yellow-900/50 text-yellow-400 ring-yellow-500/30',
        '2e plaats': 'bg-slate-600/50 text-slate-200 ring-slate-400/30',
        '3e plaats': 'bg-amber-900/50 text-amber-300 ring-amber-500/30',
        '5e plaats': 'bg-slate-800 text-slate-400 ring-slate-600/30',
        '7e plaats': 'bg-slate-800 text-slate-400 ring-slate-600/30',
    };
    const icons = {
        '1e plaats': '🥇',
        '2e plaats': '🥈',
        '3e plaats': '🥉',
    };
    const style = styles[result] || 'bg-slate-800 text-slate-400 ring-slate-600/30';
    const icon = icons[result] || null;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${style}`}>
            {icon && <span>{icon}</span>}
            {result}
        </span>
    );
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('nl-BE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export default function Results({ tournaments }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const count = tournaments.length;

    const goTo = useCallback((idx) => {
        setActiveIndex(idx);
        setProgress(0);
    }, []);

    // Auto-advance slideshow
    useEffect(() => {
        if (count === 0) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    setActiveIndex((i) => (i + 1) % count);
                    return 0;
                }
                return prev + (100 / (SLIDE_DURATION / 100));
            });
        }, 100);

        return () => clearInterval(interval);
    }, [count]);

    if (count === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
                <Head title="Resultaten" />
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0" />
                    </svg>
                </div>
                <p className="text-lg text-slate-400">Geen toernooi resultaten beschikbaar</p>
                <Link href="/attendance/choose" className="mt-6 text-sm text-rose-400 hover:text-rose-300">
                    ← Terug
                </Link>
            </div>
        );
    }

    const tournament = tournaments[activeIndex];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Head title="Toernooi Resultaten" />

            {/* Header */}
            <div className="flex-shrink-0 px-6 pt-5 pb-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/attendance/choose" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                        ← Terug
                    </Link>

                    {/* Tournament dots */}
                    <div className="flex items-center gap-2">
                        {tournaments.map((t, idx) => (
                            <button
                                key={t.id}
                                onClick={() => goTo(idx)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                    idx === activeIndex
                                        ? 'bg-rose-500 scale-125'
                                        : 'bg-slate-700 hover:bg-slate-600'
                                }`}
                            />
                        ))}
                    </div>

                    <span className="text-xs text-slate-600 tabular-nums">
                        {activeIndex + 1} / {count}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="max-w-7xl mx-auto mt-3 h-0.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-rose-600 transition-[width] duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Tournament content */}
            <div className="flex-1 px-6 pb-6 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Tournament title */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
                                <p className="text-sm text-slate-400">
                                    {formatDate(tournament.tournament_date)}
                                    {tournament.address_city && ` — ${tournament.address_city}`}
                                    <span className="ml-3 inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                                        {tournament.totalParticipants} deelnemers
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Results grouped by age/weight */}
                    {tournament.participantGroups.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-lg text-slate-400">Geen deelnemers voor dit toernooi</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {tournament.participantGroups.map((ageGroup) => (
                                <div key={ageGroup.name} className="bg-slate-900 rounded-xl ring-1 ring-slate-800/60 border-t-2 border-t-rose-700 overflow-hidden">
                                    <div className="px-5 py-3 border-b border-slate-800/60">
                                        <h2 className="text-sm font-semibold text-white">
                                            <span className="inline-flex items-center rounded-full bg-rose-900/30 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
                                                {ageGroup.name}
                                            </span>
                                        </h2>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {ageGroup.weights.map((weightGroup) => (
                                                <div key={weightGroup.name} className="rounded-xl ring-1 ring-slate-800 bg-slate-800/30 p-3">
                                                    <h4 className="text-xs font-semibold text-rose-400 mb-2">
                                                        <span className="inline-flex items-center rounded-full bg-rose-900/30 px-2 py-0.5">
                                                            {weightGroup.name}
                                                        </span>
                                                        <span className="ml-1.5 text-slate-400 font-normal">
                                                            ({weightGroup.members.length})
                                                        </span>
                                                    </h4>
                                                    <ul className="space-y-1.5">
                                                        {weightGroup.members.map((member) => (
                                                            <li key={member.id} className="flex items-center justify-between text-sm">
                                                                <span className="text-slate-300 truncate mr-2">{member.name}</span>
                                                                {resultBadge(member.result)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
