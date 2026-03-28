import { useEffect, useRef, useState, useCallback } from 'react';
import { usePage } from '@inertiajs/react';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function sendSubscriptionToServer(subscription) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    await fetch('/push-subscriptions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
                p256dh: btoa(String.fromCharCode(...new Uint8Array(key))),
                auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
            },
        }),
    });
}

export default function usePushSubscription() {
    const { vapidPublicKey, auth } = usePage().props;
    const attempted = useRef(false);
    const [pushState, setPushState] = useState('loading'); // 'loading' | 'unsupported' | 'prompt' | 'subscribed' | 'denied'

    // Check current push state on mount
    useEffect(() => {
        if (!vapidPublicKey || !auth?.user) {
            setPushState('unsupported');
            return;
        }
        if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
            setPushState('unsupported');
            return;
        }

        const permission = Notification.permission;
        if (permission === 'denied') {
            setPushState('denied');
            return;
        }
        if (permission === 'granted') {
            // Already granted — silently ensure subscription exists
            navigator.serviceWorker.ready.then(async (reg) => {
                const existing = await reg.pushManager.getSubscription();
                if (existing) {
                    await sendSubscriptionToServer(existing);
                } else {
                    const sub = await reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                    });
                    await sendSubscriptionToServer(sub);
                }
                setPushState('subscribed');
            }).catch(() => setPushState('prompt'));
            return;
        }

        // permission === 'default' — need user gesture to request
        setPushState('prompt');
    }, [vapidPublicKey, auth?.user]);

    // Manual subscribe — must be called from a click handler (user gesture)
    const subscribe = useCallback(async () => {
        if (!vapidPublicKey) return;
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setPushState(permission === 'denied' ? 'denied' : 'prompt');
                return;
            }
            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                });
            }
            await sendSubscriptionToServer(subscription);
            setPushState('subscribed');
        } catch {
            setPushState('prompt');
        }
    }, [vapidPublicKey]);

    return { pushState, subscribe };
}
