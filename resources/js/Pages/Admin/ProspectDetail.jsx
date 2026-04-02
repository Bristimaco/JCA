import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';

export default function ProspectDetail({ prospect }) {
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const noteForm = useForm({ content: '' });

    const cbe = prospect.cbe_data;

    const handleAddNote = (e) => {
        e.preventDefault();
        noteForm.post(`/admin/prospectie/${prospect.id}/notes`, {
            preserveScroll: true,
            onSuccess: () => noteForm.reset('content'),
        });
    };

    const handleDeleteNote = (noteId) => {
        if (!confirm('Notitie verwijderen?')) return;
        router.delete(`/admin/prospectie/${prospect.id}/notes/${noteId}`, { preserveScroll: true });
    };

    const handleRefresh = () => {
        router.post(`/admin/prospectie/${prospect.id}/refresh`, {}, { preserveScroll: true });
    };

    const handleConvert = () => {
        router.post(`/admin/prospectie/${prospect.id}/convert`);
    };

    const handleDelete = () => {
        router.delete(`/admin/prospectie/${prospect.id}`);
    };

    const formatVat = (vat) => {
        if (!vat) return '-';
        const str = String(vat);
        if (str.length === 10) return `BE ${str.slice(0,4)}.${str.slice(4,7)}.${str.slice(7)}`;
        if (str.length === 9) return `BE 0${str.slice(0,3)}.${str.slice(3,6)}.${str.slice(6)}`;
        return `BE ${str}`;
    };

    return (
        <AppLayout>
            <Head title={prospect.company_name} />

            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Link href="/admin/prospectie" className="text-slate-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">{prospect.company_name}</h1>
                        <p className="text-sm text-slate-400">{formatVat(prospect.vat_number)} · {prospect.legal_form || 'Onbekende rechtsvorm'}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleRefresh}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Vernieuwen
                    </button>
                    <button
                        onClick={() => setShowConvertModal(true)}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                        Omzetten naar sponsor
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="rounded-lg bg-red-900/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/50 ring-1 ring-red-700/30 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Verwijderen
                    </button>
                </div>
                {prospect.cbe_fetched_at && (
                    <p className="text-xs text-slate-500 mt-2">KBO gegevens opgehaald: {prospect.cbe_fetched_at}</p>
                )}
            </div>

            {/* Company Info */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Bedrijfsgegevens</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoItem label="Bedrijfsnaam" value={prospect.company_name} />
                    <InfoItem label="Ondernemingsnummer" value={cbe?.cbe_number_formatted || formatVat(prospect.vat_number)} />
                    <InfoItem label="Rechtsvorm" value={prospect.legal_form} />
                    <InfoItem label="Adres" value={cbe?.full_address || [prospect.address_street, prospect.address_postal_code, prospect.address_city].filter(Boolean).join(', ')} />
                    <InfoItem label="Telefoon" value={prospect.phone} />
                    <InfoItem label="E-mail" value={prospect.email} />
                    <InfoItem label="Website" value={prospect.website} link />
                    {cbe?.status && <InfoItem label="Status" value={cbe.status} />}
                    {cbe?.juridical_situation && <InfoItem label="Juridische situatie" value={cbe.juridical_situation} />}
                    {cbe?.type && <InfoItem label="Type" value={cbe.type} />}
                    {cbe?.start_date && <InfoItem label="Oprichtingsdatum" value={cbe.start_date} />}
                </div>

                {cbe?.nace_activities && cbe.nace_activities.length > 0 && (
                    <div className="mt-5">
                        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">NACE-activiteiten</p>
                        <div className="space-y-1">
                            {cbe.nace_activities.map((a, i) => (
                                <p key={i} className="text-sm text-slate-300">
                                    <span className="text-slate-500 font-mono text-xs">{a.code}</span> — {a.description}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {cbe?.establishments && cbe.establishments.length > 0 && (
                    <div className="mt-5">
                        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Vestigingen</p>
                        <div className="space-y-2">
                            {cbe.establishments.map((e, i) => (
                                <div key={i} className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3">
                                    <p className="text-sm font-medium text-white">{e.denomination || `Vestiging ${i + 1}`}</p>
                                    {e.cbe_number && <p className="text-xs text-slate-500">{e.cbe_number}</p>}
                                    {e.address && <p className="text-xs text-slate-400 mt-1">{e.address}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Map */}
            {prospect.latitude && prospect.longitude && (
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden mb-6">
                    <iframe
                        title="Locatie"
                        width="100%"
                        height="220"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${prospect.longitude - 0.01},${prospect.latitude - 0.01},${parseFloat(prospect.longitude) + 0.01},${parseFloat(prospect.latitude) + 0.01}&layer=mapnik&marker=${prospect.latitude},${prospect.longitude}`}
                    />
                </div>
            )}

            {/* Communication Log */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Communicatie log</h2>

                <form onSubmit={handleAddNote} className="mb-6">
                    <textarea
                        value={noteForm.data.content}
                        onChange={(e) => noteForm.setData('content', e.target.value)}
                        rows={3}
                        maxLength={5000}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none placeholder-slate-500"
                        placeholder="Notitie toevoegen (bv. telefonisch contact, e-mail, vergadering...)"
                    />
                    {noteForm.errors.content && (
                        <p className="mt-1 text-sm text-red-400">{noteForm.errors.content}</p>
                    )}
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={noteForm.processing || !noteForm.data.content.trim()}
                            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Toevoegen
                        </button>
                    </div>
                </form>

                {prospect.notes.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-6">Nog geen notities.</p>
                ) : (
                    <div className="space-y-3">
                        {prospect.notes.map((note) => (
                            <div key={note.id} className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-200 whitespace-pre-wrap">{note.content}</p>
                                        <p className="text-xs text-slate-500 mt-2">{note.creator_name} · {note.created_at}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="shrink-0 text-slate-500 hover:text-red-400"
                                        title="Verwijderen"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Convert Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-xl ring-1 ring-slate-700 w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Omzetten naar sponsor</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            <strong>{prospect.company_name}</strong> wordt als nieuwe sponsor aangemaakt met een Brons-contract van 1 jaar. Je wordt doorgestuurd naar de sponsors pagina.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConvertModal(false)}
                                className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleConvert}
                                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                                Omzetten
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-xl ring-1 ring-slate-700 w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Prospect verwijderen</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Weet je zeker dat je <strong>{prospect.company_name}</strong> wilt verwijderen? Alle notities worden ook verwijderd.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Verwijderen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function InfoItem({ label, value, extra, link }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            {link && value ? (
                <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm text-rose-400 hover:text-rose-300 mt-0.5 block">{value}</a>
            ) : (
                <p className="text-sm text-white mt-0.5">{value || '-'}</p>
            )}
            {extra && <p className="text-xs text-slate-500 mt-0.5">{extra}</p>}
        </div>
    );
}
