import { useEffect, useRef, useState } from 'react';

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

export default function QrPaymentOverlay({ amount, paymentId, qrSrc, checkoutUrl, onClose, onPaid }) {
    const [status, setStatus] = useState('open');
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!paymentId) return;

        intervalRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/pos/payment/${paymentId}/status`, {
                    headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                });
                const data = await res.json();
                setStatus(data.status);

                if (data.status === 'paid') {
                    clearInterval(intervalRef.current);
                    setTimeout(() => onPaid?.(), 2000);
                } else if (['expired', 'canceled', 'failed'].includes(data.status)) {
                    clearInterval(intervalRef.current);
                }
            } catch {
                // network error, keep polling
            }
        }, 3000);

        return () => clearInterval(intervalRef.current);
    }, [paymentId]);

    const statusLabel = {
        open: 'Wachten op betaling…',
        pending: 'Wachten op betaling…',
        paid: 'Betaald!',
        expired: 'Betaling verlopen',
        canceled: 'Betaling geannuleerd',
        failed: 'Betaling mislukt',
    };

    const isPaid = status === 'paid';
    const isFinal = ['expired', 'canceled', 'failed'].includes(status);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={isFinal || isPaid ? onClose : undefined}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-1">QR Betaling</h2>
                <p className="text-2xl font-semibold text-blue-700 mb-4">€{Number(amount).toFixed(2)}</p>

                {qrSrc && !isPaid && !isFinal && (
                    <div className="mb-4">
                        <img src={qrSrc} alt="Scan QR code om te betalen" className="mx-auto w-56 h-56" />
                        <p className="text-sm text-gray-500 mt-2">Scan met Bancontact of je bank-app</p>
                    </div>
                )}

                {!qrSrc && !isPaid && !isFinal && checkoutUrl && checkoutUrl !== '#test-mode' && (
                    <div className="mb-4">
                        <a
                            href={checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                        >
                            Open betaallink
                        </a>
                    </div>
                )}

                {!qrSrc && !isPaid && !isFinal && (!checkoutUrl || checkoutUrl === '#test-mode') && (
                    <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-700">Test mode — geen QR beschikbaar</p>
                    </div>
                )}

                <div className={`text-lg font-medium mb-4 ${isPaid ? 'text-green-600' : isFinal ? 'text-red-600' : 'text-gray-600'}`}>
                    {isPaid && <span className="text-3xl block mb-1">✓</span>}
                    {statusLabel[status] ?? status}
                </div>

                {!isPaid && !isFinal && (
                    <div className="flex justify-center mb-4">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                <button
                    onClick={onClose}
                    className={`w-full py-2 rounded-lg font-medium ${isPaid ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    {isPaid ? 'Sluiten' : isFinal ? 'Sluiten' : 'Annuleren'}
                </button>
            </div>
        </div>
    );
}
