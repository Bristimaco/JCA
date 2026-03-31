import { Head } from '@inertiajs/react';
import { useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import AppLayout from '../../Layouts/AppLayout';

function resizeImage(file, maxSize = 1920, quality = 0.85) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > maxSize || height > maxSize) {
                    const ratio = Math.min(maxSize / width, maxSize / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

const STATUS_BADGES = {
    draft: { label: 'Concept', bg: 'bg-slate-700', text: 'text-slate-300' },
    published: { label: 'Gepubliceerd', bg: 'bg-emerald-900/40', text: 'text-emerald-400' },
    registration_closed: { label: 'Inschrijvingen gesloten', bg: 'bg-rose-900/40', text: 'text-rose-400' },
    archived: { label: 'Gearchiveerd', bg: 'bg-amber-900/40', text: 'text-amber-400' },
};

function StatusBadge({ status }) {
    const b = STATUS_BADGES[status] || STATUS_BADGES.draft;
    return <span className={`inline-flex items-center rounded-full ${b.bg} px-2.5 py-0.5 text-xs font-semibold ${b.text}`}>{b.label}</span>;
}

function EventFormFields({ form, imageRef }) {
    const handleImage = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const dataUrl = await resizeImage(file);
            form.setData('image', dataUrl);
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Naam *</label>
                <input type="text" value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="w-full rounded-lg bg-slate-800 text-white text-sm px-3 py-2 ring-1 ring-slate-700 focus:ring-rose-500 focus:outline-none" />
                {form.errors.name && <p className="text-xs text-red-400 mt-1">{form.errors.name}</p>}
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Beschrijving</label>
                <textarea value={form.data.description || ''} onChange={e => form.setData('description', e.target.value)} rows={2} className="w-full rounded-lg bg-slate-800 text-white text-sm px-3 py-2 ring-1 ring-slate-700 focus:ring-rose-500 focus:outline-none" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Datum *</label>
                <input type="date" value={form.data.event_date} onChange={e => form.setData('event_date', e.target.value)} className="w-full rounded-lg bg-slate-800 text-white text-sm px-3 py-2 ring-1 ring-slate-700 focus:ring-rose-500 focus:outline-none" />
                {form.errors.event_date && <p className="text-xs text-red-400 mt-1">{form.errors.event_date}</p>}
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Uur</label>
                <input type="time" value={form.data.event_time || ''} onChange={e => form.setData('event_time', e.target.value)} className="w-full rounded-lg bg-slate-800 text-white text-sm px-3 py-2 ring-1 ring-slate-700 focus:ring-rose-500 focus:outline-none" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Straat</label>
                <input type="text" value={form.data.address_street || ''} onChange={e => form.setData('address_street', e.target.value)} className="w-full rounded-lg bg-slate-800 text-white text-sm px-3 py-2 ring-1 ring-slate-700 focus:ring-rose-500 focus:outline-none" />
            </div>
            <div className="flex gap-2">
                <div className="w-1/3">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Postcode</label>
                    <input type="text" value={form.data.address_postal_code || ''} onChange={e => form.setData('address_postal_code', e.target.value)} className="w-full rounded-lg bg-slate-800 text-white text-sm px-3 py-2 ring-1 ring-slate-700 focus:ring-rose-500 focus:outline-none" />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Stad</label>
                    <input type="text" value={form.data.address_city || ''} onChange={e => form.setData('address_city', e.target.value)} className="w-full rounded-lg bg-slate-800 text-white text-sm px-3 py-2 ring-1 ring-slate-700 focus:ring-rose-500 focus:outline-none" />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Prijs volwassene (€) *</label>
                <input type="number" step="0.01" min="0" value={form.data.price_adult} onChange={e => form.setData('price_adult', e.target.value)} className="w-full rounded-lg bg-slate-800 text-white text-sm px-3 py-2 ring-1 ring-slate-700 focus:ring-rose-500 focus:outline-none" />
                {form.errors.price_adult && <p className="text-xs text-red-400 mt-1">{form.errors.price_adult}</p>}
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Prijs kind (€) *</label>
                <input type="number" step="0.01" min="0" value={form.data.price_child} onChange={e => form.setData('price_child', e.target.value)} className="w-full rounded-lg bg-slate-800 text-white text-sm px-3 py-2 ring-1 ring-slate-700 focus:ring-rose-500 focus:outline-none" />
                {form.errors.price_child && <p className="text-xs text-red-400 mt-1">{form.errors.price_child}</p>}
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Afbeelding</label>
                <input ref={imageRef} type="file" accept="image/*" onChange={handleImage} className="w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-slate-600" />
            </div>
        </div>
    );
}

function AddEventForm() {
    const [open, setOpen] = useState(false);
    const imageRef = useRef(null);
    const form = useForm({
        name: '', description: '', event_date: '', event_time: '',
        address_street: '', address_city: '', address_postal_code: '',
        price_adult: '0.00', price_child: '0.00', image: null,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/admin/evenementen', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                if (imageRef.current) imageRef.current.value = '';
                setOpen(false);
            },
        });
    };

    return (
        <div className="px-6 py-4 border-b border-slate-800">
            {!open ? (
                <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-rose-400 hover:text-rose-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Nieuw evenement
                </button>
            ) : (
                <form onSubmit={submit}>
                    <EventFormFields form={form} imageRef={imageRef} />
                    <div className="flex gap-2 mt-3">
                        <button type="submit" disabled={form.processing} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">Opslaan</button>
                        <button type="button" onClick={() => { form.reset(); setOpen(false); }} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600">Annuleren</button>
                    </div>
                </form>
            )}
        </div>
    );
}

function EventRow({ event, onEdit }) {
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('nl-BE') : '-';

    return (
        <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white truncate">{event.name}</p>
                    <StatusBadge status={event.status} />
                </div>
                <p className="text-sm text-slate-400">{fmtDate(event.event_date)}{event.event_time ? ` om ${event.event_time}` : ''}</p>
                {(event.address_street || event.address_city) && (
                    <p className="text-xs text-slate-500">{[event.address_street, event.address_postal_code, event.address_city].filter(Boolean).join(', ')}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">Volw: €{Number(event.price_adult).toFixed(2)}</span>
                    <span className="text-xs text-slate-400">Kind: €{Number(event.price_child).toFixed(2)}</span>
                    <span className="text-xs text-emerald-400 font-medium">{event.registration_count} betaald</span>
                    {event.total_registrations > event.registration_count && (
                        <span className="text-xs text-amber-400">({event.total_registrations} totaal)</span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {event.status === 'draft' && (
                    <button onClick={() => router.post(`/admin/evenementen/${event.id}/publish`, {}, { preserveScroll: true })} className="rounded-lg bg-emerald-900/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-900/50 ring-1 ring-emerald-700/30">Publiceren</button>
                )}
                {event.status === 'published' && (
                    <>
                        <a href={`/admin/evenementen/${event.id}/registrations`} className="rounded-lg bg-blue-900/30 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-900/50 ring-1 ring-blue-700/30">Inschrijvingen</a>
                        <button onClick={() => { if (confirm('Herinneringen versturen naar niet-ingeschreven leden?')) router.post(`/admin/evenementen/${event.id}/resend-invitations`, {}, { preserveScroll: true }); }} className="rounded-lg bg-amber-900/30 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-900/50 ring-1 ring-amber-700/30">Herinnering versturen</button>
                        <button onClick={() => { if (confirm('Inschrijvingen sluiten? Betaallinks worden aangemaakt.')) router.post(`/admin/evenementen/${event.id}/close-registrations`, {}, { preserveScroll: true }); }} className="rounded-lg bg-rose-900/30 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/50 ring-1 ring-rose-700/30">Inschrijvingen sluiten</button>
                    </>
                )}
                {event.status === 'registration_closed' && (
                    <>
                        <a href={`/admin/evenementen/${event.id}/registrations`} className="rounded-lg bg-blue-900/30 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:bg-blue-900/50 ring-1 ring-blue-700/30">Inschrijvingen</a>
                        <button onClick={() => { if (confirm('Dit evenement archiveren?')) router.post(`/admin/evenementen/${event.id}/archive`, {}, { preserveScroll: true }); }} className="rounded-lg bg-amber-900/30 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-900/50 ring-1 ring-amber-700/30">Archiveren</button>
                    </>
                )}
                {event.status !== 'archived' && (
                    <button onClick={() => onEdit()} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-600">Bewerken</button>
                )}
                {event.status === 'draft' && (
                    <button onClick={() => { if (confirm('Dit evenement verwijderen?')) router.delete(`/admin/evenementen/${event.id}`, { preserveScroll: true }); }} className="rounded-lg bg-red-900/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/50 ring-1 ring-red-700/30">Verwijderen</button>
                )}
            </div>
        </div>
    );
}

function EditRow({ event, onCancel, onSuccess }) {
    const imageRef = useRef(null);
    const form = useForm({
        name: event.name, description: event.description || '', event_date: event.event_date?.split('T')[0] || '',
        event_time: event.event_time || '', address_street: event.address_street || '',
        address_city: event.address_city || '', address_postal_code: event.address_postal_code || '',
        price_adult: event.price_adult, price_child: event.price_child,
        image: null, remove_image: false,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(`/admin/evenementen/${event.id}`, { preserveScroll: true, onSuccess });
    };

    return (
        <div className="px-6 py-4 bg-slate-800/50">
            <form onSubmit={submit}>
                <EventFormFields form={form} imageRef={imageRef} />
                {event.has_image && (
                    <label className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                        <input type="checkbox" checked={form.data.remove_image} onChange={e => form.setData('remove_image', e.target.checked)} className="rounded bg-slate-700 border-slate-600" />
                        Afbeelding verwijderen
                    </label>
                )}
                <div className="flex gap-2 mt-3">
                    <button type="submit" disabled={form.processing} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">Opslaan</button>
                    <button type="button" onClick={onCancel} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600">Annuleren</button>
                </div>
            </form>
        </div>
    );
}

export default function Events({ events }) {
    const { flash } = usePage().props;
    const [editingId, setEditingId] = useState(null);

    return (
        <AppLayout>
            <Head title="Evenementen" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Evenementen</h1>
                <p className="text-sm text-slate-400 mt-1">Beheer club evenementen</p>
            </div>
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                {flash.status && (
                    <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 ring-1 ring-emerald-700/30 p-3">
                        <p className="text-sm text-emerald-400">{flash.status}</p>
                    </div>
                )}
                <AddEventForm />
                {events.length === 0 ? (
                    <div className="px-6 py-8 text-center text-slate-500">Geen evenementen gevonden.</div>
                ) : (
                    <div className="divide-y divide-slate-800">
                        {events.map((ev) =>
                            editingId === ev.id ? (
                                <EditRow key={ev.id} event={ev} onCancel={() => setEditingId(null)} onSuccess={() => setEditingId(null)} />
                            ) : (
                                <EventRow key={ev.id} event={ev} onEdit={() => setEditingId(ev.id)} />
                            )
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
