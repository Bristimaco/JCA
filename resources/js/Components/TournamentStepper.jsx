import { router } from '@inertiajs/react';
import { useState } from 'react';

const STEPS = [
    { value: 'preparation', label: 'Voorbereiding', short: 'Voorb.' },
    { value: 'invitations_sent', label: 'Uitnodigingen verstuurd', short: 'Uitnod.' },
    { value: 'registrations_open', label: 'Inschrijvingen gestart', short: 'Inschrijv.' },
    { value: 'registrations_closed', label: 'Inschrijvingen voltooid', short: 'Voltooid' },
    { value: 'started', label: 'Gestart', short: 'Gestart' },
    { value: 'finished', label: 'Afgelopen', short: 'Afgelopen' },
    { value: 'archived', label: 'Gearchiveerd', short: 'Archief' },
];

const FORWARD_ROUTES = {
    preparation: (id) => `/admin/tournaments/${id}/close-invitations`,
    invitations_sent: (id) => `/admin/tournaments/${id}/open-registrations`,
    registrations_open: (id) => `/admin/tournaments/${id}/close-registrations`,
    registrations_closed: (id) => `/admin/tournaments/${id}/start`,
    // started → finished: trainer only, blocked for admin
    finished: (id) => `/admin/tournaments/${id}/archive`,
};

export default function TournamentStepper({ status, compact = false, interactive = false, tournamentId = null, onTransitionError = null }) {
    const [loading, setLoading] = useState(false);
    const currentIndex = STEPS.findIndex(s => s.value === status);

    const handleStepClick = (stepIndex) => {
        if (!interactive || !tournamentId || loading) return;

        // Click on current or already-completed step that isn't a revert target
        if (stepIndex === currentIndex) return;

        // Forward: only allow clicking the next step
        if (stepIndex === currentIndex + 1) {
            const currentValue = STEPS[currentIndex].value;

            // started → finished is trainer-only
            if (currentValue === 'started') return;

            const routeFn = FORWARD_ROUTES[currentValue];
            if (!routeFn) return;

            // Special case: closing registrations needs confirmation
            if (currentValue === 'registrations_open') {
                if (!confirm('Inschrijvingen afsluiten? Niet-ingeschreven deelnemers worden uitgesloten.')) return;
                setLoading(true);
                router.post(routeFn(tournamentId), { confirmed: '1' }, {
                    preserveScroll: true,
                    onError: (errors) => {
                        setLoading(false);
                        if (onTransitionError) onTransitionError(errors);
                    },
                    onSuccess: () => setLoading(false),
                    onFinish: () => setLoading(false),
                });
                return;
            }

            setLoading(true);
            router.post(routeFn(tournamentId), {}, {
                preserveScroll: true,
                onError: (errors) => {
                    setLoading(false);
                    if (onTransitionError) onTransitionError(errors);
                },
                onSuccess: () => setLoading(false),
                onFinish: () => setLoading(false),
            });
            return;
        }

        // Backward: revert to previous status
        if (stepIndex < currentIndex) {
            // Backend blocks revert for started and finished
            if (status === 'started' || status === 'finished') return;

            setLoading(true);
            router.post(`/admin/tournaments/${tournamentId}/revert-status`, {}, {
                preserveScroll: true,
                onError: (errors) => {
                    setLoading(false);
                    if (onTransitionError) onTransitionError(errors);
                },
                onSuccess: () => setLoading(false),
                onFinish: () => setLoading(false),
            });
        }
    };

    const getStepState = (index) => {
        if (index < currentIndex) return 'completed';
        if (index === currentIndex) return 'current';
        return 'future';
    };

    const isClickable = (index) => {
        if (!interactive || loading) return false;
        // Next step (forward)
        if (index === currentIndex + 1) {
            // started → finished is trainer only
            if (STEPS[currentIndex].value === 'started') return false;
            return !!FORWARD_ROUTES[STEPS[currentIndex].value];
        }
        // Previous step (revert) — only to immediate previous
        if (index === currentIndex - 1) {
            return status !== 'started' && status !== 'finished' && status !== 'preparation';
        }
        return false;
    };

    if (compact) {
        return (
            <div className="flex items-center gap-1" title={STEPS[currentIndex]?.label}>
                {STEPS.map((step, i) => {
                    const state = getStepState(i);
                    return (
                        <div key={step.value} className="flex items-center">
                            <div
                                className={`rounded-full transition-all ${state === 'completed' ? 'w-2 h-2 bg-rose-600' :
                                    state === 'current' ? 'w-2.5 h-2.5 bg-rose-500 ring-2 ring-rose-400/40' :
                                        'w-2 h-2 bg-slate-600'
                                    }`}
                                title={step.label}
                            />
                            {i < STEPS.length - 1 && (
                                <div className={`w-2 h-px ${state === 'completed' ? 'bg-rose-600/60' : 'bg-slate-700'}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="w-full py-3 pb-8 md:pb-9">
            <div className="flex items-center">
                {STEPS.map((step, i) => {
                    const state = getStepState(i);
                    const clickable = isClickable(i);
                    const isTrainerOnly = interactive && i === currentIndex + 1 && STEPS[currentIndex]?.value === 'started';

                    return (
                        <div key={step.value} className="flex items-center flex-1 last:flex-none">
                            {/* Step circle + label */}
                            <div className="flex flex-col items-center relative">
                                <button
                                    type="button"
                                    onClick={() => clickable && handleStepClick(i)}
                                    disabled={!clickable}
                                    title={isTrainerOnly ? 'Enkel via trainer' : step.label}
                                    className={`relative flex items-center justify-center rounded-full text-xs font-bold transition-all
                                        ${state === 'completed'
                                            ? `w-7 h-7 bg-rose-600 text-white ${clickable ? 'cursor-pointer hover:bg-rose-500 hover:ring-2 hover:ring-rose-400/50' : ''}`
                                            : state === 'current'
                                                ? 'w-8 h-8 bg-rose-600 text-white ring-2 ring-rose-400/40 shadow-lg shadow-rose-900/30'
                                                : `w-7 h-7 border-2 border-slate-600 bg-transparent text-slate-500
                                                    ${clickable ? 'cursor-pointer hover:border-rose-500/50 hover:text-rose-400 hover:bg-rose-900/20' : ''}
                                                    ${isTrainerOnly ? 'cursor-not-allowed' : ''}`
                                        }
                                        ${loading ? 'opacity-60' : ''}
                                    `}
                                >
                                    {state === 'completed' ? (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span>{i + 1}</span>
                                    )}
                                    {loading && clickable && (
                                        <span className="absolute inset-0 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
                                    )}
                                </button>
                                <span className={`absolute top-full mt-1.5 whitespace-nowrap text-[10px] font-medium hidden md:block
                                    ${state === 'current' ? 'text-white font-semibold' :
                                        state === 'completed' ? 'text-rose-400' : 'text-slate-500'}
                                `}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Connecting line */}
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${i < currentIndex ? 'bg-rose-600/60' : 'bg-slate-700'
                                    }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
