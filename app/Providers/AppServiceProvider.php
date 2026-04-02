<?php

namespace App\Providers;

use App\Models\ClubSettings;
use App\Models\TestModeLog;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Notifications\Events\NotificationSending;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        Event::listen(NotificationSending::class, function (NotificationSending $event) {
            if (! ClubSettings::current()->test_mode) {
                return true;
            }

            $channel = $event->channel;
            $notification = $event->notification;
            $notifiable = $event->notifiable;

            TestModeLog::create([
                'type' => 'notification',
                'recipient' => $notifiable->email ?? $notifiable->name ?? 'Onbekend',
                'subject' => class_basename($notification).' ('.$channel.')',
                'body' => method_exists($notification, 'toArray') ? json_encode($notification->toArray($notifiable), JSON_UNESCAPED_UNICODE) : null,
                'created_at' => now(),
            ]);

            return false;
        });

        Event::listen(MessageSending::class, function (MessageSending $event) {
            if (! ClubSettings::current()->test_mode) {
                return true;
            }

            if ($event->message->getSubject() === 'Wachtwoord resetten') {
                return true;
            }

            $to = collect($event->message->getTo())->map(fn ($a) => $a->getAddress())->implode(', ');

            TestModeLog::create([
                'type' => 'mail',
                'recipient' => $to,
                'subject' => $event->message->getSubject() ?? 'Geen onderwerp',
                'body' => null,
                'created_at' => now(),
            ]);

            return false;
        });
    }
}
