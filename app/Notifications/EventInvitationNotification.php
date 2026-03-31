<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\Event;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Event $event,
    ) {}

    public function via(object $notifiable): array
    {
        $pref = $notifiable->notification_preference;

        $channels = [];
        if ($pref->wantsApp()) {
            $channels[] = 'database';
            $channels[] = WebPushChannel::class;
        }
        if ($pref->wantsEmail()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $e = $this->event;
        $address = collect([$e->address_street, $e->address_postal_code.' '.$e->address_city])->filter()->implode(', ');

        return (new MailMessage)
            ->subject('Uitnodiging: '.$e->name)
            ->greeting('Hallo '.$notifiable->name.'!')
            ->line('Je bent uitgenodigd voor **'.$e->name.'**.')
            ->line('📅 '.$e->event_date->format('d/m/Y').($e->event_time ? ' om '.$e->event_time : ''))
            ->when($address, fn ($msg) => $msg->line('📍 '.$address))
            ->line('💰 Volwassenen: €'.number_format($e->price_adult, 2, ',', '.').' — Kinderen: €'.number_format($e->price_child, 2, ',', '.'))
            ->action('Inschrijven', url("/evenementen/{$e->id}/inschrijven"))
            ->line('We hopen je er te zien!');
    }

    public function toDatabase(object $notifiable): array
    {
        $e = $this->event;
        $address = collect([$e->address_street, $e->address_postal_code.' '.$e->address_city])->filter()->implode(', ');

        return [
            'icon' => '🎉',
            'title' => 'Evenement uitnodiging',
            'message' => $e->name.' — '.$e->event_date->format('d/m/Y').($e->event_time ? ' om '.$e->event_time : ''),
            'event_id' => $e->id,
            'register_url' => url("/evenementen/{$e->id}/inschrijven"),
            'detail' => [
                'event_name' => $e->name,
                'date' => $e->event_date->format('d/m/Y'),
                'time' => $e->event_time,
                'address' => $address ?: null,
                'price_adult' => $e->price_adult,
                'price_child' => $e->price_child,
                'body' => 'Je bent uitgenodigd voor '.$e->name.'. Schrijf je in en betaal om je plaats te bevestigen.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => 'Evenement uitnodiging',
            'body' => $this->event->name.' — '.$this->event->event_date->format('d/m/Y'),
            'url' => "/evenementen/{$this->event->id}/inschrijven",
        ];
    }
}
