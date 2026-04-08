import { router } from '@inertiajs/react';
import { useState } from 'react';

const STEPS = [
    { value: 'preparation', label: 'Voorbereiding', short: 'Voorb.' },
    { value: 'invitations_sent', label: 'Uitnodigingen verstuurd', short: 'Uitnod.' },
    { value: 'registrations_open', label: 'Inschrijvingen gestart', short: 'Inschrijv.' },
    { value: 'registrations_closed', label: 'Inschrijvingen voltooid', short: 'Voltooid' },
    { value: 'archived', label: 'Gearchiveerd', short: 'Archief' },
];

const FORWARD_ROUTES = {
    preparation: (id) => `/admin/stages/${id}/close-invitations`,
    invitations_sent: (id) => `/admin/stages/${id}/open-registrations`,
    registrations_open: (id) => `/admin/stages/${id}/close-registrations`,
    registrations_closed: (id) => `/admin/stages/${id}/archive`,
};

export default function StageStepper({ status, compact = false, interactive = false, stageId = null, onTransitionError = null, onTransitionStart = null, userRole = null }) {
    const [loading, setLoading] = useState(false);
    const currentIndex = STEPS.findIndex(s => s.value === status);

    const handleStepClick = (stepIndex) => {
        if (!interactive || !stageId || loading) return;

        if (stepIndex === currentIndex) return;

        // Forward: only allow clicking the next step
        if (stepIndex === currentIndex + 1) {
            const currentValue = STEPS[currentIndex].value;

            // Role-based forward restrictions
            if (userRole === 'coach') {
                if (!['preparation'].includes(currentValue)) return;
            }
            if (userRole === 'admin') {
                // Admin can do all forward transitions
            }

            const routeFn = FORWARD_ROUTES[currentValue];
            if (!routeFn) return;

            // Special case: closing registrations needs confirmation
            if (currentValue === 'registrations_open') {
                if (!confirm('Inschrijvingen afsluiten? Niet-ingeschreven deelnemers worden uitgesloten.')) return;
                if (onTransitionStart) onTransitionStart();
                setLoading(true);
                router.post(routeFn(stageId), { confirmed: '1' }, {
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

            if (onTransitionStart) onTransitionStart();
            setLoading(true);
            router.post(routeFn(stageId), {}, {
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
            if (userRole === 'coach') {
                if (status !== 'invitations_sent') return;
            }
            if (userRole === 'admin') {
                if (!['registrations_open', 'registrations_closed', 'archived'].includes(status)) return;
            }

            if (onTransitionStart) onTransitionStart();
            setLoading(true);
            router.post(`/admin/stages/${stageId}/revert-status`, {}, {
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

    const isUserStep = (index) => {
        if (!userRole) return true;
        const stepValue = STEPS[index]?.value;
        if (index === 0) return true;
        const adminSteps = ['registrations_open', 'registrations_closed', 'archived'];
        const coachSteps = ['invitations_sent'];
        if (userRole === 'admin') return !coachSteps.includes(stepValue);
        if (userRole === 'coach') return !adminSteps.includes(stepValue);
        return true;
    };

    const isClickable = (index) => {
        if (!interactive || loading) return false;
        if (index === currentIndex + 1) {
            const currentValue = STEPS[currentIndex].value;
            if (userRole === 'coach' && !['preparation'].includes(currentValue)) return false;
            return !!FORWARD_ROUTES[currentValue];
        }
        if (index === currentIndex - 1) {
            if (status === 'preparation') return false;
            if (userRole === 'coach' && status !== 'invitations_sent') return false;
            if (userRole === 'admin' && !['registrations_open', 'registrations_closed', 'archived'].includes(status)) return false;
            return true;
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
                                className={`rounded-full transition-all ${state === 'completed' ? 'w-2 h-2 bg-teal-600' :
                                    state === 'current' ? 'w-2.5 h-2.5 bg-teal-500 ring-2 ring-teal-400/40' :
                                        'w-2 h-2 bg-slate-600'
                                    }`}
                                title={step.label}
                            />
                            {i < STEPS.length - 1 && (
                                <div className={`w-2 h-px ${state === 'completed' ? 'bg-teal-600/60' : 'bg-slate-700'}`} />
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
                    const userStep = isUserStep(i);
                    const fadedFuture = state === 'future' && !userStep;

                    return (
                        <div key={step.value} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center relative">
                                <button
                                    type="button"
                                    onClick={() => clickable && handleStepClick(i)}
                                    disabled={!clickable}
                                    title={fadedFuture ? 'Niet jouw stap' : step.label}
                                    className={`relative flex items-center justify-center rounded-full text-xs font-bold transition-all
                                        ${state === 'completed'
                                            ? `w-7 h-7 bg-teal-600 text-white ${clickable ? 'cursor-pointer hover:bg-teal-500 hover:ring-2 hover:ring-teal-400/50' : ''}`
                                            : state === 'current'
                                                ? 'w-8 h-8 bg-teal-600 text-white ring-2 ring-teal-400/40 shadow-lg shadow-teal-900/30'
                                                : fadedFuture
                                                    ? 'w-7 h-7 border-2 border-slate-700 bg-transparent text-slate-700 opacity-35'
                                                    : `w-7 h-7 border-2 border-slate-600 bg-transparent text-slate-500
                                                        ${clickable ? 'cursor-pointer hover:border-teal-500/50 hover:text-teal-400 hover:bg-teal-900/20' : ''}`
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
                                        <span className="absolute inset-0 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                                    )}
                                </button>
                                <span className={`absolute top-full mt-1.5 whitespace-nowrap text-[10px] font-medium hidden md:block
                                    ${state === 'current' ? 'text-white font-semibold' :
                                        state === 'completed' ? 'text-teal-400' :
                                            fadedFuture ? 'text-slate-600 opacity-35' : 'text-slate-500'}
                                `}>
                                    {step.label}
                                </span>
                            </div>

                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${i < currentIndex ? 'bg-teal-600/60' :
                                        !isUserStep(i + 1) ? 'bg-slate-800' : 'bg-slate-700'
                                    }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
