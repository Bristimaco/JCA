import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import AppLayout from '../../Layouts/AppLayout';

function hasCameraApi() {
    return typeof navigator !== 'undefined'
        && !!navigator.mediaDevices
        && typeof navigator.mediaDevices.getUserMedia === 'function';
}

function fileToBase64DataUrl(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

function imageFileToBase64DataUrl(file, maxSize = 1200) {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;
            if (width > maxSize || height > maxSize) {
                if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
                else { width = Math.round(width * maxSize / height); height = maxSize; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        img.src = url;
    });
}

function AttachmentModal({ transaction, onClose }) {
    const [documentData, setDocumentData] = useState(null);
    const [documentName, setDocumentName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        if (!hasCameraApi()) { setCameraError('Camera niet beschikbaar.'); return; }
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
            });
            setStream(mediaStream);
            setCameraActive(true);
            setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = mediaStream; }, 50);
        } catch { setCameraError('Camera kon niet worden geopend.'); }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
        setCameraActive(false);
    }, [stream]);

    const takePhoto = useCallback(() => {
        const video = videoRef.current; const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setDocumentData(dataUrl);
        setDocumentName('foto.jpg');
        stopCamera();
    }, [stopCamera]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        let dataUrl;
        if (file.type.startsWith('image/')) {
            dataUrl = await imageFileToBase64DataUrl(file);
        } else {
            dataUrl = await fileToBase64DataUrl(file);
        }
        if (dataUrl) {
            setDocumentData(dataUrl);
            setDocumentName(file.name);
        }
    };

    const handleUpload = () => {
        if (!documentData) return;
        setUploading(true);
        router.post(`/admin/bankbewegingen/${transaction.id}/bijlage`, {
            document: documentData,
            document_name: documentName,
        }, {
            preserveScroll: true,
            onSuccess: () => { setUploading(false); onClose(); },
            onError: () => setUploading(false),
        });
    };

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/admin/bankbewegingen/${transaction.id}/bijlage`, {
            preserveScroll: true,
            onSuccess: () => { setDeleting(false); onClose(); },
            onError: () => setDeleting(false),
        });
    };

    const isImage = transaction.document_url && transaction.document_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                    <h3 className="text-lg font-semibold text-white">Bijlage</h3>
                    <button onClick={() => { stopCamera(); onClose(); }} className="text-slate-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="text-sm text-slate-400">
                        <span className="text-white font-medium">{transaction.counterparty_name || 'Onbekend'}</span>
                        {' — '}
                        <span className={transaction.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {transaction.amount >= 0 ? '+' : '-'}€{Math.abs(transaction.amount).toLocaleString('nl-BE', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Existing attachment */}
                    {transaction.has_document && (
                        <div className="rounded-lg bg-slate-800 p-4 ring-1 ring-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm text-slate-300 font-medium">{transaction.document_name}</p>
                                <div className="flex gap-2">
                                    <a href={transaction.document_url} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-sky-400 hover:text-sky-300">Openen</a>
                                    <button onClick={handleDelete} disabled={deleting}
                                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
                                        {deleting ? 'Bezig...' : 'Verwijderen'}
                                    </button>
                                </div>
                            </div>
                            {isImage && (
                                <img src={transaction.document_url} alt="Bijlage" className="w-full rounded-md border border-slate-700" />
                            )}
                        </div>
                    )}

                    {/* Upload new */}
                    <div>
                        <p className="text-xs font-medium text-slate-400 mb-2">
                            {transaction.has_document ? 'Vervang bijlage' : 'Bijlage toevoegen'}
                        </p>

                        {cameraActive ? (
                            <div className="space-y-2">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg border border-slate-700" />
                                <div className="flex gap-2">
                                    <button onClick={takePhoto} className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700">Foto nemen</button>
                                    <button onClick={stopCamera} className="rounded-md bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-700">Annuleren</button>
                                </div>
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                        ) : (
                            <>
                                {documentData && (
                                    <div className="mb-3 relative inline-block">
                                        {documentData.startsWith('data:image/') ? (
                                            <img src={documentData} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-slate-700" />
                                        ) : (
                                            <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 ring-1 ring-slate-700">
                                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                                <span className="text-sm text-slate-300">{documentName}</span>
                                            </div>
                                        )}
                                        <button onClick={() => { setDocumentData(null); setDocumentName(''); }}
                                            className="absolute -top-1.5 -right-1.5 bg-red-900/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none hover:bg-red-600">&times;</button>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange}
                                        className="w-full text-sm text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-200 hover:file:bg-slate-700" />
                                    {hasCameraApi() && (
                                        <button onClick={startCamera}
                                            className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-700 whitespace-nowrap ring-1 ring-slate-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8z" />
                                                <path d="M10 13a3 3 0 100-6 3 3 0 000 6z" />
                                            </svg>
                                            Camera
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                        {cameraError && <p className="text-xs text-rose-400 mt-1">{cameraError}</p>}
                    </div>

                    {documentData && (
                        <button onClick={handleUpload} disabled={uploading}
                            className="w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            {uploading ? 'Bezig met uploaden...' : 'Bijlage opslaan'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function BankTransactions({ transactions, accounts, filters, dimensions, imports }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [account, setAccount] = useState(filters.account || '');
    const [from, setFrom] = useState(filters.from || '');
    const [to, setTo] = useState(filters.to || '');
    const [dim1, setDim1] = useState(filters.dimension_1 || '');
    const [dim2, setDim2] = useState(filters.dimension_2 || '');
    const [dim3, setDim3] = useState(filters.dimension_3 || '');
    const [attachmentTransaction, setAttachmentTransaction] = useState(null);
    const [deleteFilename, setDeleteFilename] = useState(null);

    const activeDimensions = dimensions.filter(d => d !== null);

    const importForm = useForm({ file: null, account_number: accounts.length === 1 ? accounts[0].number : '' });

    const applyFilters = () => {
        router.get('/admin/bankbewegingen', {
            ...(search && { search }),
            ...(account && { account }),
            ...(from && { from }),
            ...(to && { to }),
            ...(dim1 && { dimension_1: dim1 }),
            ...(dim2 && { dimension_2: dim2 }),
            ...(dim3 && { dimension_3: dim3 }),
        }, { preserveState: true, preserveScroll: true });
    };

    const resetFilters = () => {
        setSearch('');
        setAccount('');
        setFrom('');
        setTo('');
        setDim1('');
        setDim2('');
        setDim3('');
        router.get('/admin/bankbewegingen', {}, { preserveState: true });
    };

    const handleDimensionChange = (transactionId, field, value) => {
        router.patch(`/admin/bankbewegingen/${transactionId}/dimensies`, {
            dimension_1_value: transactions.find(t => t.id === transactionId)?.dimension_1_value || null,
            dimension_2_value: transactions.find(t => t.id === transactionId)?.dimension_2_value || null,
            dimension_3_value: transactions.find(t => t.id === transactionId)?.dimension_3_value || null,
            [field]: value || null,
        }, { preserveScroll: true, preserveState: true });
    };

    const handleImport = (e) => {
        e.preventDefault();
        if (!importForm.data.file) return;
        importForm.post('/admin/bankbewegingen/import', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => importForm.reset('file'),
        });
    };

    const formatAmount = (amount) => {
        const n = Number(amount);
        const formatted = Math.abs(n).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return n >= 0 ? `+€${formatted}` : `-€${formatted}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const hasActiveFilters = search || account || from || to || dim1 || dim2 || dim3;

    return (
        <AppLayout>
            <Head title="Financieel Beheer" />

            <div className="mb-6 flex items-center gap-3">
                <Link href="/" className="text-slate-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </Link>
                <h1 className="text-2xl font-bold text-white">Financieel Beheer</h1>
            </div>

            {flash?.status && (
                <div className="mb-4 rounded-lg bg-emerald-900/50 border border-emerald-700/50 p-4">
                    <p className="text-sm text-emerald-300">{flash.status}</p>
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 rounded-lg bg-red-900/50 border border-red-700/50 p-4">
                    <p className="text-sm text-red-300">{flash.error}</p>
                </div>
            )}

            {/* Import */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-3">CODA Bestand Importeren</h2>
                {accounts.length === 0 ? (
                    <p className="text-sm text-slate-400">Configureer eerst minstens één bankrekening in de <Link href="/" className="text-rose-400 hover:text-rose-300 underline">clubinstellingen</Link> om CODA bestanden te importeren.</p>
                ) : (
                    <form onSubmit={handleImport} className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Rekening</label>
                            <select
                                value={importForm.data.account_number}
                                onChange={(e) => importForm.setData('account_number', e.target.value)}
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            >
                                {accounts.length > 1 && <option value="">Selecteer rekening...</option>}
                                {accounts.map((a) => (
                                    <option key={a.number} value={a.number}>{a.name} ({a.number})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-medium text-slate-400 mb-1">Selecteer een .cod bestand</label>
                            <input
                                type="file"
                                accept=".cod,.coda"
                                onChange={(e) => importForm.setData('file', e.target.files[0])}
                                className="w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700 file:ring-1 file:ring-slate-700"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={importForm.processing || !importForm.data.file || !importForm.data.account_number}
                            className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Importeren
                        </button>
                    </form>
                )}
                {Object.keys(importForm.errors).length > 0 && (
                    <div className="mt-3">
                        {Object.values(importForm.errors).map((err, i) => (
                            <p key={i} className="text-sm text-red-400">{err}</p>
                        ))}
                    </div>
                )}
            </div>

            {/* Import history */}
            {imports.length > 0 && (
                <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-3">Geïmporteerde Bestanden</h2>
                    <div className="space-y-2">
                        {imports.map((imp) => (
                            <div key={imp.filename} className="flex items-center justify-between rounded-lg bg-slate-800/50 ring-1 ring-slate-700/50 px-4 py-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white truncate">{imp.filename}</p>
                                    <p className="text-xs text-slate-400">
                                        {imp.count} transactie{imp.count !== 1 ? 's' : ''} — {formatDate(imp.min_date)}{imp.min_date !== imp.max_date ? ` t/m ${formatDate(imp.max_date)}` : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDeleteFilename(imp.filename)}
                                    className="ml-3 text-slate-400 hover:text-red-400"
                                    title="Import verwijderen"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {deleteFilename && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setDeleteFilename(null)}>
                    <div className="bg-slate-900 rounded-xl ring-1 ring-slate-700 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-2">Import verwijderen?</h3>
                        <p className="text-sm text-slate-400 mb-1">
                            Alle transacties uit <span className="font-medium text-white">{deleteFilename}</span> worden permanent verwijderd.
                        </p>
                        <p className="text-xs text-slate-500 mb-5">Dit kan niet ongedaan gemaakt worden. U kunt het bestand nadien opnieuw importeren.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteFilename(null)}
                                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={() => {
                                    router.delete('/admin/bankbewegingen/import', {
                                        data: { filename: deleteFilename },
                                        preserveScroll: true,
                                        onSuccess: () => setDeleteFilename(null),
                                    });
                                }}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Verwijderen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Zoeken</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            placeholder="Naam, rekening, mededeling..."
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent placeholder-slate-500"
                        />
                    </div>
                    {accounts.length > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Rekening</label>
                            <select
                                value={account}
                                onChange={(e) => setAccount(e.target.value)}
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            >
                                <option value="">Alle rekeningen</option>
                                {accounts.map((a) => (
                                    <option key={a.number} value={a.number}>{a.name || a.number}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Van</label>
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Tot</label>
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                    </div>
                </div>
                {activeDimensions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {dimensions[0] && (
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">{dimensions[0].name}</label>
                                <select value={dim1} onChange={(e) => setDim1(e.target.value)}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                                    <option value="">Alle</option>
                                    {dimensions[0].values.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                        )}
                        {dimensions[1] && (
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">{dimensions[1].name}</label>
                                <select value={dim2} onChange={(e) => setDim2(e.target.value)}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                                    <option value="">Alle</option>
                                    {dimensions[1].values.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                        )}
                        {dimensions[2] && (
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">{dimensions[2].name}</label>
                                <select value={dim3} onChange={(e) => setDim3(e.target.value)}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                                    <option value="">Alle</option>
                                    {dimensions[2].values.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                )}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={applyFilters}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                    >
                        Filteren
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700"
                        >
                            Filters wissen
                        </button>
                    )}
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-slate-900 rounded-xl ring-1 ring-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Transacties</h2>
                    <span className="text-sm text-slate-400">{transactions.length} resultaten</span>
                </div>

                {transactions.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500">
                        {hasActiveFilters ? 'Geen transacties gevonden voor deze filters.' : 'Nog geen transacties geïmporteerd. Upload een CODA bestand om te beginnen.'}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-3">Datum</th>
                                        <th className="px-6 py-3">Tegenpartij</th>
                                        <th className="px-6 py-3">Rekening</th>
                                        <th className="px-6 py-3 text-right">Bedrag</th>
                                        <th className="px-6 py-3">Mededeling</th>
                                        {dimensions[0] && <th className="px-4 py-3">{dimensions[0].name}</th>}
                                        {dimensions[1] && <th className="px-4 py-3">{dimensions[1].name}</th>}
                                        {dimensions[2] && <th className="px-4 py-3">{dimensions[2].name}</th>}
                                        <th className="px-6 py-3 text-center">Bijlage</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-800/50">
                                            <td className="px-6 py-3 text-slate-300 whitespace-nowrap">{formatDate(t.transaction_date)}</td>
                                            <td className="px-6 py-3 text-white font-medium">{t.counterparty_name || '-'}</td>
                                            <td className="px-6 py-3 text-slate-400 font-mono text-xs">{t.counterparty_account || '-'}</td>
                                            <td className={`px-6 py-3 text-right font-semibold whitespace-nowrap ${t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {formatAmount(t.amount)}
                                            </td>
                                            <td className="px-6 py-3 text-slate-400 max-w-xs truncate">
                                                {t.structured_message || t.message || '-'}
                                            </td>
                                            {dimensions[0] && (
                                                <td className="px-4 py-3">
                                                    <select value={t.dimension_1_value || ''} onChange={(e) => handleDimensionChange(t.id, 'dimension_1_value', e.target.value)}
                                                        className="w-full rounded bg-slate-800 border border-slate-700 text-xs text-white px-2 py-1 focus:ring-1 focus:ring-rose-500 focus:border-transparent">
                                                        <option value="">—</option>
                                                        {dimensions[0].values.map(v => <option key={v} value={v}>{v}</option>)}
                                                    </select>
                                                </td>
                                            )}
                                            {dimensions[1] && (
                                                <td className="px-4 py-3">
                                                    <select value={t.dimension_2_value || ''} onChange={(e) => handleDimensionChange(t.id, 'dimension_2_value', e.target.value)}
                                                        className="w-full rounded bg-slate-800 border border-slate-700 text-xs text-white px-2 py-1 focus:ring-1 focus:ring-rose-500 focus:border-transparent">
                                                        <option value="">—</option>
                                                        {dimensions[1].values.map(v => <option key={v} value={v}>{v}</option>)}
                                                    </select>
                                                </td>
                                            )}
                                            {dimensions[2] && (
                                                <td className="px-4 py-3">
                                                    <select value={t.dimension_3_value || ''} onChange={(e) => handleDimensionChange(t.id, 'dimension_3_value', e.target.value)}
                                                        className="w-full rounded bg-slate-800 border border-slate-700 text-xs text-white px-2 py-1 focus:ring-1 focus:ring-rose-500 focus:border-transparent">
                                                        <option value="">—</option>
                                                        {dimensions[2].values.map(v => <option key={v} value={v}>{v}</option>)}
                                                    </select>
                                                </td>
                                            )}
                                            <td className="px-6 py-3 text-center">
                                                <button onClick={() => setAttachmentTransaction(t)} className={`inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-slate-700 ${t.has_document ? 'text-emerald-400' : 'text-slate-500'}`} title={t.has_document ? t.document_name : 'Bijlage toevoegen'}>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="lg:hidden divide-y divide-slate-800">
                            {transactions.map((t) => (
                                <div key={t.id} className="px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-white truncate">{t.counterparty_name || '-'}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(t.transaction_date)}</p>
                                            {(t.structured_message || t.message) && (
                                                <p className="text-xs text-slate-400 mt-1 truncate">{t.structured_message || t.message}</p>
                                            )}
                                            {activeDimensions.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {dimensions[0] && (
                                                        <select value={t.dimension_1_value || ''} onChange={(e) => handleDimensionChange(t.id, 'dimension_1_value', e.target.value)}
                                                            className="rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 px-1.5 py-0.5 focus:ring-1 focus:ring-rose-500">
                                                            <option value="">{dimensions[0].name}</option>
                                                            {dimensions[0].values.map(v => <option key={v} value={v}>{v}</option>)}
                                                        </select>
                                                    )}
                                                    {dimensions[1] && (
                                                        <select value={t.dimension_2_value || ''} onChange={(e) => handleDimensionChange(t.id, 'dimension_2_value', e.target.value)}
                                                            className="rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 px-1.5 py-0.5 focus:ring-1 focus:ring-rose-500">
                                                            <option value="">{dimensions[1].name}</option>
                                                            {dimensions[1].values.map(v => <option key={v} value={v}>{v}</option>)}
                                                        </select>
                                                    )}
                                                    {dimensions[2] && (
                                                        <select value={t.dimension_3_value || ''} onChange={(e) => handleDimensionChange(t.id, 'dimension_3_value', e.target.value)}
                                                            className="rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 px-1.5 py-0.5 focus:ring-1 focus:ring-rose-500">
                                                            <option value="">{dimensions[2].name}</option>
                                                            {dimensions[2].values.map(v => <option key={v} value={v}>{v}</option>)}
                                                        </select>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setAttachmentTransaction(t)} className={`w-7 h-7 flex items-center justify-center rounded-md ${t.has_document ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                            </button>
                                            <span className={`text-sm font-semibold whitespace-nowrap ${t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {formatAmount(t.amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {attachmentTransaction && (
                <AttachmentModal
                    transaction={attachmentTransaction}
                    onClose={() => setAttachmentTransaction(null)}
                />
            )}
        </AppLayout>
    );
}
