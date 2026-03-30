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

// Build slides from tournaments + announcements
function buildSlides(tournaments, announcements = []) {
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
            slides.push({ type: 'tournament', tournament, cards: [], page: 1, totalPages: 1 });
            continue;
        }

        // Chunk cards into slides
        const totalPages = Math.ceil(cards.length / MAX_CARDS_PER_SLIDE);
        for (let i = 0; i < totalPages; i++) {
            slides.push({
                type: 'tournament',
                tournament,
                cards: cards.slice(i * MAX_CARDS_PER_SLIDE, (i + 1) * MAX_CARDS_PER_SLIDE),
                page: i + 1,
                totalPages,
            });
        }
    }

    // Append announcement slides
    for (const announcement of announcements) {
        slides.push({ type: 'announcement', announcement });
    }

    return slides;
}

export default function Results({ tournaments, announcements = [], sponsors = [], sponsorFrequencies = {} }) {
    const slides = useMemo(() => buildSlides(tournaments, announcements), [tournaments, announcements]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [currentSponsor, setCurrentSponsor] = useState(null);

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

    // Sponsor banner rotation based on tier frequency
    useEffect(() => {
        if (sponsors.length === 0) return;

        const freqs = {
            gold: (sponsorFrequencies.gold || 15) * 1000,
            silver: (sponsorFrequencies.silver || 30) * 1000,
            bronze: (sponsorFrequencies.bronze || 60) * 1000,
        };

        // Build weighted queue: gold first (most frequent), then silver, then bronze
        const byTier = { gold: [], silver: [], bronze: [] };
        sponsors.forEach((s) => {
            if (byTier[s.tier]) byTier[s.tier].push(s);
        });

        const indices = { gold: 0, silver: 0, bronze: 0 };
        const lastShown = { gold: 0, silver: 0, bronze: 0 };

        const pickNext = () => {
            const now = Date.now();
            // Priority: gold > silver > bronze
            for (const tier of ['gold', 'silver', 'bronze']) {
                if (byTier[tier].length === 0) continue;
                if (now - lastShown[tier] >= freqs[tier]) {
                    const sponsor = byTier[tier][indices[tier] % byTier[tier].length];
                    indices[tier]++;
                    lastShown[tier] = now;
                    return sponsor;
                }
            }
            return null;
        };

        // Show first sponsor immediately
        const first = sponsors.find((s) => s.tier === 'gold') || sponsors[0];
        setCurrentSponsor(first);
        lastShown[first.tier] = Date.now();
        indices[first.tier] = 1;

        const interval = setInterval(() => {
            const next = pickNext();
            if (next) setCurrentSponsor(next);
        }, 1000);

        return () => clearInterval(interval);
    }, [sponsors, sponsorFrequencies]);

    if (count === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10">
                <Head title="Resultaten" />
                <div className="w-24 h-24 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0" />
                    </svg>
                </div>
                <p className="text-3xl text-slate-400">Geen resultaten of mededelingen beschikbaar</p>
                <Link href="/attendance/choose" className="mt-8 text-lg text-rose-400 hover:text-rose-300">
                    ← Terug
                </Link>
            </div>
        );
    }

    const slide = slides[activeIndex];

    // Group cards by age group for display (tournament slides only)
    const groupedCards = [];
    if (slide.type === 'tournament') {
        for (const card of slide.cards) {
            const last = groupedCards[groupedCards.length - 1];
            if (last && last.ageGroup.name === card.ageGroup.name) {
                last.weights.push(card.weightGroup);
            } else {
                groupedCards.push({ ageGroup: card.ageGroup, weights: [card.weightGroup] });
            }
        }
    }

    return (
        <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
            <Head title="Resultaten" />

            {/* Sponsor banner */}
            {currentSponsor && (
                <div className="flex-shrink-0 bg-white/5 border-b border-slate-800 px-8 py-2 flex items-center justify-center">
                    <img
                        src={currentSponsor.logo}
                        alt={currentSponsor.name}
                        className="max-h-14 max-w-[50vw] object-contain"
                    />
                </div>
            )}

            {/* Header — fixed height */}
            <div className="flex-shrink-0 px-8 pt-4 pb-2">
                <div className="flex items-center justify-between">
                    <Link href="/attendance/choose" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                        ← Terug
                    </Link>

                    <div className="flex items-center gap-3">
                        {slides.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => goTo(idx)}
                                className={`w-3.5 h-3.5 rounded-full transition-all ${idx === activeIndex
                                    ? 'bg-rose-500 scale-125'
                                    : s.type === 'announcement'
                                        ? 'bg-amber-800 hover:bg-amber-700'
                                        : s.type === 'tournament' && slide.type === 'tournament' && s.tournament.id === slide.tournament.id
                                            ? 'bg-rose-800 hover:bg-rose-700'
                                            : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>

                    <span className="text-base text-slate-600 tabular-nums">
                        {activeIndex + 1} / {count}
                    </span>
                </div>

                <div className="mt-2 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-rose-600 transition-[width] duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Content — fills remaining height, never scrolls */}
            <div className="flex-1 min-h-0 flex flex-col px-8 pb-4">
                {slide.type === 'announcement' ? (
                    <AnnouncementSlide announcement={slide.announcement} />
                ) : (
                    <TournamentSlide slide={slide} groupedCards={groupedCards} />
                )}
            </div>
        </div>
    );
}

function AnnouncementSlide({ announcement }) {
    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 flex flex-col bg-slate-900 rounded-2xl ring-1 ring-slate-800/60 border-t-2 border-t-amber-600 overflow-hidden">
                <div className="flex-shrink-0 px-8 py-4 border-b border-slate-800/60 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-600 to-yellow-700 flex items-center justify-center shadow-lg flex-shrink-0">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Mededeling</p>
                        <h1 className="text-5xl font-bold text-white leading-tight">{announcement.title}</h1>
                    </div>
                </div>
                <div className="flex-1 min-h-0 p-8 flex">
                    <div className={`flex-1 min-h-0 flex ${announcement.photo ? 'gap-8' : ''}`}>
                        <div className="flex-1 flex items-center">
                            <p className="text-3xl text-slate-300 leading-relaxed whitespace-pre-line">{announcement.content}</p>
                        </div>
                        {announcement.photo && (
                            <div className="flex-1 min-h-0 flex items-center justify-center">
                                <img
                                    src={announcement.photo}
                                    alt=""
                                    className="max-w-full max-h-full rounded-xl ring-1 ring-slate-700 object-contain"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TournamentSlide({ slide, groupedCards }) {
    const { tournament, cards, page, totalPages } = slide;

    return (
        <>
            {/* Tournament title — fixed */}
            <div className="flex-shrink-0 mb-3">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-7.54 0" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white leading-tight">
                            {tournament.name}
                            {totalPages > 1 && (
                                <span className="ml-3 text-xl font-normal text-slate-500">
                                    pagina {page}/{totalPages}
                                </span>
                            )}
                        </h1>
                        <p className="text-lg text-slate-400">
                            {formatDate(tournament.tournament_date)}
                            {tournament.address_city && ` — ${tournament.address_city}`}
                            <span className="ml-3 inline-flex items-center rounded-full bg-slate-800 px-3 py-0.5 text-base font-medium text-slate-400">
                                {tournament.totalParticipants} deelnemers
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Cards area — fills remaining, flexes to fit */}
            {cards.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-3xl text-slate-400">Geen deelnemers voor dit toernooi</p>
                </div>
            ) : (
                <div className="flex-1 min-h-0 flex flex-col gap-3">
                    {groupedCards.map((group) => (
                        <div key={`${group.ageGroup.name}-${page}`} className="flex-1 min-h-0 flex flex-col bg-slate-900 rounded-2xl ring-1 ring-slate-800/60 border-t-2 border-t-rose-700 overflow-hidden">
                            <div className="flex-shrink-0 px-5 py-2 border-b border-slate-800/60">
                                <span className="inline-flex items-center rounded-full bg-rose-900/30 px-4 py-1 text-lg font-semibold text-rose-300">
                                    {group.ageGroup.name}
                                </span>
                            </div>
                            <div className="flex-1 min-h-0 p-4">
                                <div className="grid grid-cols-2 gap-6 h-full">
                                    {group.weights.map((weightGroup) => (
                                        <div key={weightGroup.name} className="flex flex-col min-h-0 rounded-2xl ring-1 ring-slate-800 bg-slate-800/30 p-4">
                                            <h4 className="flex-shrink-0 text-lg font-semibold text-rose-400 mb-2">
                                                <span className="inline-flex items-center rounded-full bg-rose-900/30 px-3 py-0.5">
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
                                                    <img src={photoUrl} alt="Podiumfoto" className="flex-1 min-h-0 w-full rounded-xl mb-2 ring-1 ring-slate-700 object-contain" />
                                                ) : null;
                                            })()}
                                            <ul className="flex-shrink-0 space-y-1.5">
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
        </>
    );
}
