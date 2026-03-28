<?php

namespace App\Notifications;

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
    ) {}

    public function via(object $notifiable): array
    {
        $pref = $notifiable->notification_preference;

        $channels = [];
        if ($pref->wantsApp()) {
            $channels[] = 'database';
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
            ->subject('Trainer info: '.$this->tournament->name)
            ->view('emails.tournament-trainer-notification', [
                'tournament' => $this->tournament,
                'participants' => $this->participants,
                'club' => $club,
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'icon' => '📋',
            'title' => 'Trainer info',
            'message' => $this->tournament->name.' — '.$this->participants->count().' deelnemers',
            'tournament_id' => $this->tournament->id,
        ];
    }
}
