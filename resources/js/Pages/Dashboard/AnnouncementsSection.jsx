import { useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';

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

export default function AnnouncementsSection({ announcements }) {
    const { flash } = usePage().props;
    const [editingId, setEditingId] = useState(null);

    return (
        <>
            {flash.status && (
                <div className="mx-6 mt-4 rounded-md bg-emerald-900/30 ring-1 ring-emerald-700/30 p-3">
                    <p className="text-sm text-emerald-400">{flash.status}</p>
                </div>
            )}
            <AddAnnouncementForm />
            {announcements.length === 0 ? (
                <div className="px-6 py-8 text-center text-slate-500">Geen mededelingen gevonden.</div>
            ) : (
                <div className="divide-y divide-slate-800">
                    {announcements.map((a) =>
                        editingId === a.id ? (
                            <EditRow key={a.id} announcement={a} onCancel={() => setEditingId(null)} onSuccess={() => setEditingId(null)} />
                        ) : (
                            <AnnouncementRow key={a.id} announcement={a} onEdit={() => setEditingId(a.id)} />
                        )
                    )}
                </div>
            )}
        </>
    );
}

function statusBadge(a) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(a.start_date + 'T00:00:00');
    const end = new Date(a.end_date + 'T00:00:00');

    if (a.is_archived) return <span className="inline-flex items-center rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-300">Gearchiveerd</span>;
    if (now < start) return <span className="inline-flex items-center rounded-full bg-amber-900/40 px-2.5 py-0.5 text-xs font-semibold text-amber-400">Gepland</span>;
    if (now > end) return <span className="inline-flex items-center rounded-full bg-red-900/40 px-2.5 py-0.5 text-xs font-semibold text-red-400">Verlopen</span>;
    return <span className="inline-flex items-center rounded-full bg-emerald-900/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">Actief</span>;
}

function AnnouncementRow({ announcement: a, onEdit }) {
    return (
        <div className="px-3 sm:px-6 py-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-white">{a.title}</h4>
                    {statusBadge(a)}
                    {a.has_photo && (
                        <span className="inline-flex items-center rounded-full bg-slate-700/60 px-2 py-0.5 text-xs text-slate-400">📷 Foto</span>
                    )}
                </div>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{a.content}</p>
                <p className="text-xs text-slate-500 mt-1">
                    {new Date(a.start_date).toLocaleDateString('nl-BE')} — {new Date(a.end_date).toLocaleDateString('nl-BE')}
                    {a.display_order > 0 && <span className="ml-2">Volgorde: {a.display_order}</span>}
                </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <button
                    onClick={() => {
                        router.post(`/admin/announcements/${a.id}/archive`, {}, { preserveScroll: true });
                    }}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300"
                >
                    {a.is_archived ? 'Activeren' : 'Archiveren'}
                </button>
                <button onClick={onEdit} className="text-xs font-medium text-rose-400 hover:text-rose-300">
                    Bewerken
                </button>
                <button
                    onClick={() => {
                        if (confirm(`Mededeling "${a.title}" verwijderen?`)) {
                            router.delete(`/admin/announcements/${a.id}`, { preserveScroll: true });
                        }
                    }}
                    className="text-xs font-medium text-red-400 hover:text-red-300"
                >
                    Verwijderen
                </button>
            </div>
        </div>
    );
}

function AddAnnouncementForm() {
    const form = useForm({
        title: '',
        content: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        display_order: '0',
        photo: '',
    });
    const fileRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const dataUrl = await resizeImage(file);
        form.setData('photo', dataUrl);
        setPhotoPreview(dataUrl);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post('/admin/announcements', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setPhotoPreview(null);
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="px-3 sm:px-6 py-4 border-b border-slate-800 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nieuwe mededeling</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Titel *</label>
                    <input
                        type="text"
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                    {form.errors.title && <p className="text-sm text-red-400 mt-1">{form.errors.title}</p>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Startdatum *</label>
                        <input
                            type="date"
                            value={form.data.start_date}
                            onChange={(e) => form.setData('start_date', e.target.value)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                        {form.errors.start_date && <p className="text-sm text-red-400 mt-1">{form.errors.start_date}</p>}
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Einddatum *</label>
                        <input
                            type="date"
                            value={form.data.end_date}
                            onChange={(e) => form.setData('end_date', e.target.value)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                        {form.errors.end_date && <p className="text-sm text-red-400 mt-1">{form.errors.end_date}</p>}
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Volgorde</label>
                        <input
                            type="number"
                            value={form.data.display_order}
                            onChange={(e) => form.setData('display_order', e.target.value)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm text-slate-300 mb-1">Inhoud *</label>
                <textarea
                    value={form.data.content}
                    onChange={(e) => form.setData('content', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                />
                {form.errors.content && <p className="text-sm text-red-400 mt-1">{form.errors.content}</p>}
            </div>

            <div className="flex items-center gap-4">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Foto (optioneel)</label>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhoto}
                        className="text-sm text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-slate-600"
                    />
                </div>
                {photoPreview && (
                    <img src={photoPreview} alt="" className="w-16 h-16 rounded-lg object-cover ring-1 ring-slate-600" />
                )}
            </div>

            <button
                type="submit"
                disabled={form.processing}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50"
            >
                Toevoegen
            </button>
        </form>
    );
}

function EditRow({ announcement: a, onCancel, onSuccess }) {
    const form = useForm({
        title: a.title,
        content: a.content,
        start_date: a.start_date,
        end_date: a.end_date,
        display_order: String(a.display_order),
        photo: '',
        remove_photo: false,
    });
    const fileRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const dataUrl = await resizeImage(file);
        form.setData('photo', dataUrl);
        setPhotoPreview(dataUrl);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        form.patch(`/admin/announcements/${a.id}`, {
            preserveScroll: true,
            onSuccess,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="px-3 sm:px-6 py-4 bg-slate-800/30 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Titel *</label>
                    <input
                        type="text"
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                    />
                    {form.errors.title && <p className="text-sm text-red-400 mt-1">{form.errors.title}</p>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Startdatum *</label>
                        <input
                            type="date"
                            value={form.data.start_date}
                            onChange={(e) => form.setData('start_date', e.target.value)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Einddatum *</label>
                        <input
                            type="date"
                            value={form.data.end_date}
                            onChange={(e) => form.setData('end_date', e.target.value)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Volgorde</label>
                        <input
                            type="number"
                            value={form.data.display_order}
                            onChange={(e) => form.setData('display_order', e.target.value)}
                            className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm text-slate-300 mb-1">Inhoud *</label>
                <textarea
                    value={form.data.content}
                    onChange={(e) => form.setData('content', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                />
                {form.errors.content && <p className="text-sm text-red-400 mt-1">{form.errors.content}</p>}
            </div>

            <div className="flex items-center gap-4">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Foto {a.has_photo ? '(huidige vervangen)' : '(optioneel)'}</label>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhoto}
                        className="text-sm text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-slate-600"
                    />
                </div>
                {photoPreview && (
                    <img src={photoPreview} alt="" className="w-16 h-16 rounded-lg object-cover ring-1 ring-slate-600" />
                )}
                {a.has_photo && !form.data.remove_photo && !photoPreview && (
                    <button
                        type="button"
                        onClick={() => form.setData('remove_photo', true)}
                        className="text-xs text-red-400 hover:text-red-300"
                    >
                        Foto verwijderen
                    </button>
                )}
                {form.data.remove_photo && (
                    <span className="text-xs text-red-400">Foto wordt verwijderd bij opslaan</span>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-50"
                >
                    Opslaan
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
                >
                    Annuleren
                </button>
            </div>
        </form>
    );
}
