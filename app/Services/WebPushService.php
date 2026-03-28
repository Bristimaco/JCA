<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushService
{
    protected WebPush $webPush;

    public function __construct()
    {
        $this->webPush = new WebPush([
            'VAPID' => [
                'subject' => config('app.url'),
                'publicKey' => config('services.vapid.public_key'),
                'privateKey' => config('services.vapid.private_key'),
            ],
        ]);

        $this->webPush->setAutomaticPadding(false);
    }

    public function sendToUser(User $user, string $title, string $body, ?string $url = null, ?string $icon = null): void
    {
        $subscriptions = $user->pushSubscriptions;

        if ($subscriptions->isEmpty()) {
            return;
        }

        $payload = json_encode([
            'title' => $title,
            'body' => $body,
            'url' => $url ?? '/',
            'icon' => $icon ?? '/icons/icon-192.png',
        ]);

        foreach ($subscriptions as $pushSubscription) {
            $this->webPush->queueNotification(
                Subscription::create([
                    'endpoint' => $pushSubscription->endpoint,
                    'publicKey' => $pushSubscription->p256dh_key,
                    'authToken' => $pushSubscription->auth_key,
                ]),
                $payload
            );
        }

        $this->processResults($subscriptions);
    }

    public function sendToUsers($users, string $title, string $body, ?string $url = null, ?string $icon = null): void
    {
        $subscriptions = PushSubscription::whereIn('user_id', $users->pluck('id'))->get();

        if ($subscriptions->isEmpty()) {
            return;
        }

        $payload = json_encode([
            'title' => $title,
            'body' => $body,
            'url' => $url ?? '/',
            'icon' => $icon ?? '/icons/icon-192.png',
        ]);

        foreach ($subscriptions as $pushSubscription) {
            $this->webPush->queueNotification(
                Subscription::create([
                    'endpoint' => $pushSubscription->endpoint,
                    'publicKey' => $pushSubscription->p256dh_key,
                    'authToken' => $pushSubscription->auth_key,
                ]),
                $payload
            );
        }

        $this->processResults($subscriptions);
    }

    protected function processResults($subscriptions): void
    {
        $results = $this->webPush->flush();

        $subscriptionArray = $subscriptions->values()->all();
        $index = 0;

        foreach ($results as $report) {
            if (! $report->isSuccess() && isset($subscriptionArray[$index])) {
                $statusCode = $report->getResponse()?->getStatusCode();

                // 404 or 410 = subscription expired, remove it
                if (in_array($statusCode, [404, 410])) {
                    $subscriptionArray[$index]->delete();
                }
            }
            $index++;
        }
    }
}
