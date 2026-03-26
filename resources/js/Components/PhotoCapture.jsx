import { useRef, useState, useCallback, useEffect } from 'react';

function hasCameraApi() {
    return typeof navigator !== 'undefined'
        && !!navigator.mediaDevices
        && typeof navigator.mediaDevices.getUserMedia === 'function';
}

function fileToBase64DataUrl(file, maxSize = 1200) {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round(height * maxSize / width);
                    width = maxSize;
                } else {
                    width = Math.round(width * maxSize / height);
                    height = maxSize;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };
        img.src = url;
    });
}

export default function PhotoCapture({ onCapture, currentPhotoUrl, error }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState(null);
    const [preview, setPreview] = useState(null);
    const [cameraError, setCameraError] = useState(null);

    const displaySrc = preview || currentPhotoUrl;

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, cameraActive]);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        if (!hasCameraApi()) {
            setCameraError('Camera is niet beschikbaar. Gebruik HTTPS of kies een bestand.');
            return;
        }
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
            });
            setStream(mediaStream);
            setCameraActive(true);
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

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreview(dataUrl);
        onCapture(dataUrl);
        stopCamera();
    }, [onCapture, stopCamera]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const dataUrl = await fileToBase64DataUrl(file);
            if (dataUrl) {
                setPreview(dataUrl);
                onCapture(dataUrl);
            }
        }
    };

    const clearPhoto = () => {
        setPreview(null);
        onCapture(null);
    };

    return (
        <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Foto</label>

            {displaySrc && (
                <div className="mb-2 relative inline-block">
                    <img src={displaySrc} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-slate-700" />
                    <button type="button" onClick={clearPhoto}
                        className="absolute -top-1.5 -right-1.5 bg-red-900/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none hover:bg-red-600">
                        &times;
                    </button>
                </div>
            )}

            {cameraActive ? (
                <div className="space-y-2">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-sm rounded-lg border border-slate-700" />
                    <div className="flex gap-2">
                        <button type="button" onClick={takePhoto}
                            className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700">
                            Foto nemen
                        </button>
                        <button type="button" onClick={stopCamera}
                            className="rounded-md bg-slate-800 border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-700">
                            Annuleren
                        </button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input type="file" accept="image/*" onChange={handleFileChange}
                        className="w-full text-sm text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-200 hover:file:bg-slate-700" />
                    {hasCameraApi() && (
                        <button type="button" onClick={startCamera}
                            className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-700 whitespace-nowrap">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Z" />
                                <path d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                            </svg>
                            Camera
                        </button>
                    )}
                </div>
            )}

            {cameraError && <p className="text-xs text-rose-400 mt-1">{cameraError}</p>}
            {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
        </div>
    );
}
