import { Head, Link } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '../Layouts/AppLayout';

export default function POS({ products: initialProducts }) {
    const [quantities, setQuantities] = useState({});
    const [products, setProducts] = useState(initialProducts);
    const [showVoucher, setShowVoucher] = useState(false);
    const [gridCols, setGridCols] = useState(5);
    const [saving, setSaving] = useState(false);
    const [orderSaved, setOrderSaved] = useState(false);
    const gridRef = useRef(null);

    // Voucher state
    const [voucherCode, setVoucherCode] = useState('');
    const [voucher, setVoucher] = useState(null);
    const [voucherLoading, setVoucherLoading] = useState(false);
    const [voucherRedeeming, setVoucherRedeeming] = useState(false);
    const [voucherError, setVoucherError] = useState(null);
    const [voucherSuccess, setVoucherSuccess] = useState(null);
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef(null);
    const scannerInstanceRef = useRef(null);

    const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.content;

    const getQty = (id) => quantities[id] || 0;

    const increment = (id) => {
        setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const decrement = (id) => {
        setQuantities((prev) => {
            const current = prev[id] || 0;
            if (current <= 0) return prev;
            return { ...prev, [id]: current - 1 };
        });
    };

    const total = products.reduce((sum, p) => sum + getQty(p.id) * Number(p.price), 0);
    const itemCount = Object.values(quantities).reduce((sum, q) => sum + q, 0);

    const reset = () => setQuantities({});

    const saveAndReset = async () => {
        if (itemCount === 0) return;
        setSaving(true);
        try {
            const items = Object.entries(quantities)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => ({ product_id: Number(id), quantity: qty }));

            await fetch('/pos/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), Accept: 'application/json' },
                body: JSON.stringify({ items }),
            });

            reset();
            setOrderSaved(true);
            setTimeout(() => setOrderSaved(false), 2000);
        } catch { /* network error — still reset */ reset(); }
        setSaving(false);
    };

    const toggleRefill = async (productId) => {
        try {
            const res = await fetch(`/pos/products/${productId}/toggle-refill`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), Accept: 'application/json' },
            });
            if (res.ok) {
                const data = await res.json();
                setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, needs_refill: data.needs_refill } : p));
            }
        } catch { /* network error */ }
    };

    // Voucher functions
    const resetVoucherPanel = () => {
        setVoucherCode('');
        setVoucher(null);
        setVoucherError(null);
        setVoucherSuccess(null);
        stopScanner();
    };

    const openVoucherPanel = () => {
        resetVoucherPanel();
        setShowVoucher(true);
    };

    const closeVoucherPanel = () => {
        resetVoucherPanel();
        setShowVoucher(false);
    };

    const handleLookup = async (lookupCode) => {
        const c = (lookupCode || voucherCode).trim().toUpperCase();
        if (!c) return;
        setVoucherLoading(true);
        setVoucherError(null);
        setVoucherSuccess(null);
        setVoucher(null);
        try {
            const res = await fetch('/vouchers/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), Accept: 'application/json' },
                body: JSON.stringify({ code: c }),
            });
            const data = await res.json();
            if (res.ok) {
                setVoucher(data);
                setVoucherCode(data.code);
            } else {
                setVoucherError(data.error || 'Voucher niet gevonden.');
            }
        } catch {
            setVoucherError('Netwerkfout.');
        }
        setVoucherLoading(false);
    };

    const handleRedeem = async () => {
        if (!voucher) return;
        setVoucherRedeeming(true);
        setVoucherError(null);
        setVoucherSuccess(null);
        try {
            const res = await fetch('/vouchers/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), Accept: 'application/json' },
                body: JSON.stringify({ code: voucher.code }),
            });
            const data = await res.json();
            if (res.ok) {
                setVoucherSuccess(data.message);
                setVoucher({ ...voucher, status: 'redeemed', status_label: 'Verbruikt', is_active: false });
            } else {
                setVoucherError(data.error || 'Er ging iets mis.');
            }
        } catch {
            setVoucherError('Netwerkfout.');
        }
        setVoucherRedeeming(false);
    };

    const startScanner = async () => {
        setScanning(true);
        setVoucherError(null);
        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('pos-qr-scanner');
            scannerInstanceRef.current = scanner;
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    const match = decodedText.match(/VCH-[A-Z0-9]{6}/i);
                    if (match) {
                        stopScanner();
                        setVoucherCode(match[0].toUpperCase());
                        handleLookup(match[0].toUpperCase());
                    }
                },
            );
        } catch {
            setVoucherError('Camera kon niet worden geopend. Controleer de permissies.');
            setScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerInstanceRef.current) {
            try {
                await scannerInstanceRef.current.stop();
                scannerInstanceRef.current.clear();
            } catch { /* scanner already stopped */ }
            scannerInstanceRef.current = null;
        }
        setScanning(false);
    };

    useEffect(() => {
        return () => {
            if (scannerInstanceRef.current) {
                scannerInstanceRef.current.stop().catch(() => { });
            }
        };
    }, []);

    // Dynamic grid calculation — fit all products on one screen
    const tileCount = products.length + 1; // +1 for voucher tile
    const calcGrid = useCallback(() => {
        const el = gridRef.current;
        if (!el) return;
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (w === 0 || h === 0) return;
        const ratio = w / h;
        let cols = Math.ceil(Math.sqrt(tileCount * ratio));
        const rows = Math.ceil(tileCount / cols);
        // If rows * cols wastes too much, try reducing cols
        if (cols > 1 && (cols - 1) * rows >= tileCount) cols--;
        setGridCols(cols);
    }, [tileCount]);

    useEffect(() => {
        calcGrid();
        const el = gridRef.current;
        if (!el) return;
        const ro = new ResizeObserver(calcGrid);
        ro.observe(el);
        return () => ro.disconnect();
    }, [calcGrid]);

    const statusColors = {
        active: 'bg-emerald-900/30 text-emerald-400 ring-emerald-700/30',
        redeemed: 'bg-slate-700/50 text-slate-400 ring-slate-600/30',
        expired: 'bg-red-900/30 text-red-400 ring-red-700/30',
    };

    const gridRows = Math.ceil(tileCount / gridCols);

    return (
        <AppLayout fullWidth>
            <Head title="Kassa" />

            <div className="shrink-0 flex items-center gap-4 mb-1">
                <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-300">
                    &larr; Dashboard
                </Link>
                <h1 className="text-xl font-bold text-white tracking-tight">Kassa</h1>
            </div>

            {showVoucher ? (
                /* Voucher activation panel */
                <div className="flex-1 min-h-0 overflow-auto">
                    <div className="mx-auto max-w-lg space-y-4 pb-4">
                        <button
                            onClick={closeVoucherPanel}
                            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            &larr; Terug naar producten
                        </button>

                        <h2 className="text-xl font-bold text-white">Voucher activeren</h2>

                        {/* Code input */}
                        <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-5 space-y-4">
                            <label className="block text-sm font-medium text-slate-300">Vouchercode</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                                    placeholder="VCH-ABC123"
                                    maxLength={10}
                                    className="flex-1 rounded-md bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 px-3 py-2 text-sm font-mono focus:ring-rose-500 focus:border-rose-500"
                                />
                                <button
                                    onClick={() => handleLookup()}
                                    disabled={voucherLoading || !voucherCode.trim()}
                                    className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                                >
                                    {voucherLoading ? 'Bezig...' : 'Zoeken'}
                                </button>
                            </div>

                            {/* QR Scanner toggle */}
                            <div className="flex items-center gap-2">
                                {!scanning ? (
                                    <button
                                        onClick={startScanner}
                                        className="flex items-center gap-2 rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700"
                                    >
                                        <span>📷</span> QR-code scannen
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopScanner}
                                        className="flex items-center gap-2 rounded-md bg-red-900/50 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-900/70 ring-1 ring-red-700/30"
                                    >
                                        Camera stoppen
                                    </button>
                                )}
                            </div>

                            {/* QR Scanner area */}
                            <div
                                id="pos-qr-scanner"
                                ref={scannerRef}
                                className={`rounded-lg overflow-hidden ${scanning ? '' : 'hidden'}`}
                                style={{ minHeight: scanning ? 300 : 0 }}
                            />
                        </div>

                        {/* Error */}
                        {voucherError && (
                            <div className="rounded-xl bg-red-900/30 ring-1 ring-red-700/30 p-4">
                                <p className="text-sm text-red-400">{voucherError}</p>
                            </div>
                        )}

                        {/* Success */}
                        {voucherSuccess && (
                            <div className="rounded-xl bg-emerald-900/30 ring-1 ring-emerald-700/30 p-4">
                                <p className="text-sm text-emerald-400">✓ {voucherSuccess}</p>
                            </div>
                        )}

                        {/* Voucher result */}
                        {voucher && (
                            <div className={`rounded-xl ring-1 p-5 space-y-4 ${statusColors[voucher.status]}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white">Voucher gevonden</h3>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusColors[voucher.status]}`}>
                                        {voucher.status_label}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        {voucher.member_photo && (
                                            <img src={voucher.member_photo} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-700" />
                                        )}
                                        <div>
                                            <p className="text-white font-semibold text-lg">{voucher.member_name}</p>
                                            <p className="text-sm text-slate-400 font-mono">{voucher.code}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-slate-500 text-xs">Geldig tot</p>
                                            <p className="text-slate-200">{voucher.expires_at}</p>
                                        </div>
                                        {voucher.redeemed_at && (
                                            <div>
                                                <p className="text-slate-500 text-xs">Verbruikt op</p>
                                                <p className="text-slate-200">{voucher.redeemed_at}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {voucher.is_active && (
                                    <button
                                        onClick={handleRedeem}
                                        disabled={voucherRedeeming}
                                        className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                    >
                                        {voucherRedeeming ? 'Bezig met activeren...' : '✓ Voucher activeren'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Product grid */
                <>
                    {products.length === 0 ? (
                        <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-12 text-center text-slate-500">
                            Geen producten beschikbaar.
                        </div>
                    ) : (
                        <div ref={gridRef} className="flex-1 min-h-0">
                            <div
                                className="grid gap-1.5 h-full"
                                style={{
                                    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                                    gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                                }}
                            >
                                {products.map((product) => {
                                    const qty = getQty(product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            className={`relative rounded-lg ring-1 p-1.5 flex flex-col items-center justify-center select-none transition-all overflow-hidden ${product.needs_refill
                                                ? 'bg-amber-900/20 ring-amber-500/60 shadow-md shadow-amber-900/20'
                                                : qty > 0
                                                    ? 'bg-rose-900/20 ring-rose-700/40 shadow-md'
                                                    : 'bg-slate-900 ring-slate-800 hover:ring-slate-700'
                                                }`}
                                        >
                                            {/* Refill toggle button */}
                                            <button
                                                onClick={() => toggleRefill(product.id)}
                                                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${product.needs_refill
                                                    ? 'bg-amber-600 text-white shadow-lg'
                                                    : 'bg-slate-700/60 text-slate-500 hover:bg-slate-600 hover:text-slate-300'
                                                    }`}
                                                title={product.needs_refill ? 'Gemarkeerd als bijna op' : 'Markeer als bijna op'}
                                            >
                                                ⚠️
                                            </button>
                                            {qty > 0 && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                                                    {qty}
                                                </div>
                                            )}

                                            <p className="text-xs font-semibold text-white text-center leading-tight truncate w-full px-1">{product.name}</p>
                                            <p className="text-sm font-bold text-emerald-400">€{Number(product.price).toFixed(2)}</p>

                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <button
                                                    onClick={() => decrement(product.id)}
                                                    disabled={qty <= 0}
                                                    className="w-7 h-7 rounded-md bg-slate-700 ring-1 ring-slate-600 text-white text-sm font-bold flex items-center justify-center hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
                                                >
                                                    −
                                                </button>
                                                <span className="w-5 text-center text-sm font-bold text-white tabular-nums">{qty}</span>
                                                <button
                                                    onClick={() => increment(product.id)}
                                                    className="w-7 h-7 rounded-md bg-rose-600 text-white text-sm font-bold flex items-center justify-center hover:bg-rose-700 active:scale-95 transition-transform"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Voucher tile — always last */}
                                <button
                                    onClick={openVoucherPanel}
                                    className="rounded-lg ring-1 ring-purple-700/40 bg-purple-900/20 p-1.5 flex flex-col items-center justify-center select-none hover:ring-purple-600/60 hover:bg-purple-900/30 active:scale-95 transition-all"
                                >
                                    <span className="text-xl">🎟️</span>
                                    <p className="text-xs font-semibold text-white text-center leading-tight">Voucher</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Total bar — inline at bottom */}
                    <div className="shrink-0 bg-slate-900/95 border-t border-slate-700 px-4 py-2 mt-1">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <p className="text-2xl font-bold text-white tabular-nums">€{total.toFixed(2)}</p>
                                <p className="text-sm text-slate-400">
                                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                </p>
                                {orderSaved && (
                                    <span className="text-sm font-medium text-emerald-400">✓ Opgeslagen</span>
                                )}
                            </div>
                            <button
                                onClick={saveAndReset}
                                disabled={itemCount === 0 || saving}
                                className="rounded-lg bg-slate-700 ring-1 ring-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? 'Opslaan...' : 'Nieuwe bestelling'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
