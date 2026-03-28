import { useEffect, useRef } from 'react';
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

async function subscribeToPush(vapidPublicKey) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
    }

    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();

    if (existing) {
        // Already subscribed — ensure server knows
        await sendSubscriptionToServer(existing);
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        return;
    }

    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    await sendSubscriptionToServer(subscription);
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

    useEffect(() => {
        if (!vapidPublicKey || !auth?.user || attempted.current) return;
        attempted.current = true;

        subscribeToPush(vapidPublicKey);
    }, [vapidPublicKey, auth?.user]);
}
