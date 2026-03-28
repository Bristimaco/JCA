<?php

namespace App\Notifications;

use App\Models\ClubSettings;
use App\Models\Tournament;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class TournamentReportNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Tournament $tournament,
        public Collection $resultGroups,
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
            ->subject('Toernooiverslag: '.$this->tournament->name)
            ->view('emails.tournament-report', [
                'tournament' => $this->tournament,
                'resultGroups' => $this->resultGroups,
                'club' => $club,
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        $totalResults = $this->resultGroups->sum(fn ($g) => count($g['results']));

        return [
            'icon' => '🏆',
            'title' => 'Toernooiverslag',
            'message' => $this->tournament->name.' — '.$totalResults.' resultaten',
            'tournament_id' => $this->tournament->id,
        ];
    }
}
