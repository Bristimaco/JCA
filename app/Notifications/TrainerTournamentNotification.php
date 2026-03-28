<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\ClubSettings;
use App\Models\Tournament;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class TrainerTournamentNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Tournament $tournament,
        public Collection $participants,
    ) {
    }

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
            ->subject('Trainer info: ' . $this->tournament->name)
            ->view('emails.tournament-trainer-notification', [
                'tournament' => $this->tournament,
                'participants' => $this->participants,
                'club' => $club,
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        $t = $this->tournament;
        $address = collect([$t->address_street, $t->address_postal_code . ' ' . $t->address_city])->filter()->implode(', ');

        $participantList = $this->participants->map(fn($p) => [
            'name' => $p['name'],
            'date_of_birth' => $p['date_of_birth'],
            'age_category' => $p['age_category'] ?? '-',
            'weight_category' => $p['weight_category'] ?? '-',
            'status' => $p['invitation_status'] ?? '-',
        ])->all();

        return [
            'icon' => '📋',
            'title' => 'Trainer info',
            'message' => $t->name . ' — ' . $this->participants->count() . ' deelnemers',
            'tournament_id' => $t->id,
            'detail' => [
                'tournament_name' => $t->name,
                'date' => $t->tournament_date->format('d/m/Y'),
                'address' => $address ?: null,
                'invitation_deadline' => $t->invitation_deadline?->format('d/m/Y'),
                'registration_deadline' => $t->registration_deadline?->format('d/m/Y'),
                'participants' => $participantList,
                'body' => 'De uitnodigingsfase voor ' . $t->name . ' is afgesloten. Hieronder de deelnemerslijst.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => 'Trainer info',
            'body' => $this->tournament->name . ' — ' . $this->participants->count() . ' deelnemers',
            'url' => '/',
        ];
    }
}
