import { useState } from 'react';

export default function CollapsibleSection({ title, count, defaultOpen = false, badge, children }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-800 border-t-2 border-t-rose-700">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-3 sm:px-6 py-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
            >
                <h2 className="text-lg font-semibold text-white">
                    {title}
                    {count !== undefined && (
                        <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge || 'bg-slate-800 text-slate-400'}`}>
                            {count}
                        </span>
                    )}
                </h2>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="border-t border-slate-800">
                    {children}
                </div>
            )}
        </div>
    );
}
