<?php

namespace App\Channels;

use App\Services\WebPushService;
use Illuminate\Notifications\Notification;

class WebPushChannel
{
    public function __construct(
        protected WebPushService $webPushService,
    ) {}

    public function send(object $notifiable, Notification $notification): void
    {
        $data = $notification->toWebPush($notifiable);

        $this->webPushService->sendToUser(
            $notifiable,
            $data['title'],
            $data['body'],
            $data['url'] ?? null,
            $data['icon'] ?? null,
        );
    }
}
