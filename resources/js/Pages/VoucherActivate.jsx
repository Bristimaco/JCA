import { Head } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import { useState, useRef, useEffect } from 'react';

export default function VoucherActivate() {
    const [code, setCode] = useState('');
    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(false);
    const [redeeming, setRedeeming] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef(null);
    const scannerInstanceRef = useRef(null);

    const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.content;

    const handleLookup = async (lookupCode) => {
        const c = (lookupCode || code).trim().toUpperCase();
        if (!c) return;
        setLoading(true);
        setError(null);
        setSuccess(null);
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
                setCode(data.code);
            } else {
                setError(data.error || 'Voucher niet gevonden.');
            }
        } catch {
            setError('Netwerkfout.');
        }
        setLoading(false);
    };

    const handleRedeem = async () => {
        if (!voucher) return;
        setRedeeming(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch('/vouchers/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken(), Accept: 'application/json' },
                body: JSON.stringify({ code: voucher.code }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message);
                setVoucher({ ...voucher, status: 'redeemed', status_label: 'Verbruikt', is_active: false });
            } else {
                setError(data.error || 'Er ging iets mis.');
            }
        } catch {
            setError('Netwerkfout.');
        }
        setRedeeming(false);
    };

    const startScanner = async () => {
        setScanning(true);
        setError(null);
        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('qr-scanner');
            scannerInstanceRef.current = scanner;
            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    // Extract VCH-XXXXXX from QR content
                    const match = decodedText.match(/VCH-[A-Z0-9]{6}/i);
                    if (match) {
                        stopScanner();
                        setCode(match[0].toUpperCase());
                        handleLookup(match[0].toUpperCase());
                    }
                },
            );
        } catch {
            setError('Camera kon niet worden geopend. Controleer de permissies.');
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

    const statusColors = {
        active: 'bg-emerald-900/30 text-emerald-400 ring-emerald-700/30',
        redeemed: 'bg-slate-700/50 text-slate-400 ring-slate-600/30',
        expired: 'bg-red-900/30 text-red-400 ring-red-700/30',
    };

    return (
        <AppLayout>
            <Head title="Voucher activeren" />
            <div className="mx-auto max-w-lg space-y-6">
                <h1 className="text-2xl font-bold text-white">Voucher activeren</h1>

                {/* Code input */}
                <div className="rounded-xl bg-slate-900 ring-1 ring-slate-800 p-6 space-y-4">
                    <label className="block text-sm font-medium text-slate-300">Vouchercode</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                            placeholder="VCH-ABC123"
                            maxLength={10}
                            className="flex-1 rounded-md bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 px-3 py-2 text-sm font-mono focus:ring-rose-500 focus:border-rose-500"
                        />
                        <button
                            onClick={() => handleLookup()}
                            disabled={loading || !code.trim()}
                            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                        >
                            {loading ? 'Bezig...' : 'Zoeken'}
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
                        id="qr-scanner"
                        ref={scannerRef}
                        className={`rounded-lg overflow-hidden ${scanning ? '' : 'hidden'}`}
                        style={{ minHeight: scanning ? 300 : 0 }}
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-xl bg-red-900/30 ring-1 ring-red-700/30 p-4">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div className="rounded-xl bg-emerald-900/30 ring-1 ring-emerald-700/30 p-4">
                        <p className="text-sm text-emerald-400">✓ {success}</p>
                    </div>
                )}

                {/* Voucher result */}
                {voucher && (
                    <div className={`rounded-xl ring-1 p-6 space-y-4 ${statusColors[voucher.status]}`}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Voucher gevonden</h2>
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
                                disabled={redeeming}
                                className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                {redeeming ? 'Bezig met activeren...' : '✓ Voucher activeren'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
