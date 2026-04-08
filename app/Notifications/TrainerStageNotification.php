<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\ClubSettings;
use App\Models\Stage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class TrainerStageNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Stage $stage,
        public Collection $participants,
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
        $club = ClubSettings::current();

        return (new MailMessage)
            ->subject('Trainer info: '.$this->stage->name)
            ->view('emails.stage-trainer-notification', [
                'stage' => $this->stage,
                'participants' => $this->participants,
                'club' => $club,
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        $s = $this->stage;
        $address = collect([$s->address_street, $s->address_postal_code.' '.$s->address_city])->filter()->implode(', ');

        $participantList = $this->participants->map(fn ($p) => [
            'name' => $p['name'],
            'date_of_birth' => $p['date_of_birth'],
            'age_category' => $p['age_category'] ?? '-',
            'weight_category' => $p['weight_category'] ?? '-',
            'status' => $p['invitation_status'] ?? '-',
        ])->all();

        return [
            'icon' => '📋',
            'title' => 'Trainer info',
            'message' => $s->name.' — '.$this->participants->count().' deelnemers',
            'stage_id' => $s->id,
            'detail' => [
                'stage_name' => $s->name,
                'start_date' => $s->start_date->format('d/m/Y'),
                'end_date' => $s->end_date->format('d/m/Y'),
                'address' => $address ?: null,
                'invitation_deadline' => $s->invitation_deadline?->format('d/m/Y'),
                'registration_deadline' => $s->registration_deadline?->format('d/m/Y'),
                'participants' => $participantList,
                'body' => 'De uitnodigingsfase voor '.$s->name.' is afgesloten. Hieronder de deelnemerslijst.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => 'Trainer info',
            'body' => $this->stage->name.' — '.$this->participants->count().' deelnemers',
            'url' => '/',
        ];
    }
}
