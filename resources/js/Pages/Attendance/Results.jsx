import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback, useMemo } from 'react';

const SLIDE_DURATION = 15000;
const MAX_CARDS_PER_SLIDE = 2;

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
        <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-base font-semibold ring-1 ${style}`}>
            {icon && <span className="text-lg">{icon}</span>}
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

// Build slides from tournaments, chunking weight cards so each slide fits on screen
function buildSlides(tournaments) {
    const slides = [];
    for (const tournament of tournaments) {
        // Flatten all weight cards with their age group info
        const cards = [];
        for (const ageGroup of tournament.participantGroups) {
            for (const weightGroup of ageGroup.weights) {
                cards.push({ ageGroup, weightGroup });
            }
        }

        if (cards.length === 0) {
            slides.push({ tournament, cards: [], page: 1, totalPages: 1 });
            continue;
        }

        // Chunk cards into slides
        const totalPages = Math.ceil(cards.length / MAX_CARDS_PER_SLIDE);
        for (let i = 0; i < totalPages; i++) {
            slides.push({
                tournament,
                cards: cards.slice(i * MAX_CARDS_PER_SLIDE, (i + 1) * MAX_CARDS_PER_SLIDE),
                page: i + 1,
                totalPages,
            });
        }
    }
    return slides;
}

export default function Results({ tournaments }) {
    const slides = useMemo(() => buildSlides(tournaments), [tournaments]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const count = slides.length;

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
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10">
                <Head title="Resultaten" />
                <div className="w-24 h-24 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0" />
                    </svg>
                </div>
                <p className="text-3xl text-slate-400">Geen toernooi resultaten beschikbaar</p>
                <Link href="/attendance/choose" className="mt-8 text-lg text-rose-400 hover:text-rose-300">
                    ← Terug
                </Link>
            </div>
        );
    }

    const slide = slides[activeIndex];
    const { tournament, cards, page, totalPages } = slide;

    // Group cards by age group for display
    const groupedCards = [];
    for (const card of cards) {
        const last = groupedCards[groupedCards.length - 1];
        if (last && last.ageGroup.name === card.ageGroup.name) {
            last.weights.push(card.weightGroup);
        } else {
            groupedCards.push({ ageGroup: card.ageGroup, weights: [card.weightGroup] });
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Head title="Toernooi Resultaten" />

            {/* Header */}
            <div className="flex-shrink-0 px-10 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <Link href="/attendance/choose" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                        ← Terug
                    </Link>

                    {/* Slide dots */}
                    <div className="flex items-center gap-3">
                        {slides.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => goTo(idx)}
                                className={`w-4 h-4 rounded-full transition-all ${idx === activeIndex
                                    ? 'bg-rose-500 scale-125'
                                    : s.tournament.id === tournament.id
                                        ? 'bg-rose-800 hover:bg-rose-700'
                                        : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    <span className="text-lg text-slate-600 tabular-nums">
                        {activeIndex + 1} / {count}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-rose-600 transition-[width] duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Tournament content */}
            <div className="flex-1 px-10 pb-8">
                <div>
                    {/* Tournament title */}
                    <div className="mb-8">
                        <div className="flex items-center gap-5 mb-1">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-5xl font-bold text-white">
                                    {tournament.name}
                                    {totalPages > 1 && (
                                        <span className="ml-4 text-2xl font-normal text-slate-500">
                                            pagina {page}/{totalPages}
                                        </span>
                                    )}
                                </h1>
                                <p className="text-xl text-slate-400 mt-1">
                                    {formatDate(tournament.tournament_date)}
                                    {tournament.address_city && ` — ${tournament.address_city}`}
                                    <span className="ml-4 inline-flex items-center rounded-full bg-slate-800 px-4 py-1 text-lg font-medium text-slate-400">
                                        {tournament.totalParticipants} deelnemers
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Results grouped by age/weight */}
                    {cards.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-3xl text-slate-400">Geen deelnemers voor dit toernooi</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {groupedCards.map((group) => (
                                <div key={`${group.ageGroup.name}-${page}`} className="bg-slate-900 rounded-2xl ring-1 ring-slate-800/60 border-t-3 border-t-rose-700 overflow-hidden">
                                    <div className="px-7 py-4 border-b border-slate-800/60">
                                        <h2 className="text-2xl font-semibold text-white">
                                            <span className="inline-flex items-center rounded-full bg-rose-900/30 px-4 py-1 text-xl font-semibold text-rose-300">
                                                {group.ageGroup.name}
                                            </span>
                                        </h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
                                            {group.weights.map((weightGroup) => (
                                                <div key={weightGroup.name} className="rounded-2xl ring-1 ring-slate-800 bg-slate-800/30 p-5">
                                                    <h4 className="text-lg font-semibold text-rose-400 mb-3">
                                                        <span className="inline-flex items-center rounded-full bg-rose-900/30 px-3 py-1">
                                                            {weightGroup.name}
                                                        </span>
                                                        <span className="ml-2 text-slate-400 font-normal">
                                                            ({weightGroup.members.length})
                                                        </span>
                                                    </h4>
                                                    {(() => {
                                                        const photoKey = `${group.ageGroup.name}|${weightGroup.name}`;
                                                        const photoUrl = tournament.podiumPhotos?.[photoKey];
                                                        return photoUrl ? (
                                                            <img src={photoUrl} alt="Podiumfoto" className="w-full rounded-xl mb-4 ring-1 ring-slate-700 object-cover max-h-64" />
                                                        ) : null;
                                                    })()}
                                                    <ul className="space-y-3">
                                                        {weightGroup.members.map((member) => (
                                                            <li key={member.id} className="flex items-center justify-between text-xl">
                                                                <span className="text-slate-300 truncate mr-3">{member.name}</span>
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
