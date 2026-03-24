import { useRef, useState, useCallback } from 'react';

const hasCameraApi = typeof navigator !== 'undefined'
    && navigator.mediaDevices
    && typeof navigator.mediaDevices.getUserMedia === 'function';

export default function PhotoCapture({ onCapture, error }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState(null);
    const [preview, setPreview] = useState(null);
    const [cameraError, setCameraError] = useState(null);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        if (!hasCameraApi) {
            setCameraError('Camera is niet beschikbaar. Gebruik HTTPS of kies een bestand.');
            return;
        }
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
            });
            setStream(mediaStream);
            setCameraActive(true);
            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            });
        } catch (err) {
            const msg = err.name === 'NotAllowedError'
                ? 'Cameratoegang geweigerd. Sta de camera toe in je browserinstellingen.'
                : err.name === 'NotFoundError'
                    ? 'Geen camera gevonden op dit apparaat.'
                    : 'Camera kon niet worden geopend. Gebruik de bestandskiezer.';
            setCameraError(msg);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    }, [stream]);

    const takePhoto = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'camera-foto.jpg', { type: 'image/jpeg' });
                setPreview(URL.createObjectURL(blob));
                onCapture(file);
                stopCamera();
            }
        }, 'image/jpeg', 0.85);
    }, [onCapture, stopCamera]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onCapture(file);
        }
    };

    const clearPhoto = () => {
        setPreview(null);
        onCapture(null);
    };

    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Foto</label>

            {preview && (
                <div className="mb-2 relative inline-block">
                    <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                    <button type="button" onClick={clearPhoto}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none hover:bg-red-600">
                        &times;
                    </button>
                </div>
            )}

            {cameraActive ? (
                <div className="space-y-2">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-sm rounded-lg border border-gray-200" />
                    <div className="flex gap-2">
                        <button type="button" onClick={takePhoto}
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                            Foto nemen
                        </button>
                        <button type="button" onClick={stopCamera}
                            className="rounded-md bg-white border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Annuleren
                        </button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-2 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200" />
                    {hasCameraApi && (
                        <button type="button" onClick={startCamera}
                            className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 whitespace-nowrap">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Z" />
                                <path d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                            </svg>
                            Camera
                        </button>
                    )}
                </div>
            )}

            {cameraError && <p className="text-xs text-red-600 mt-1">{cameraError}</p>}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}
