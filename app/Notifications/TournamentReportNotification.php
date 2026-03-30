<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
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
        $t = $this->tournament;
        $address = collect([$t->address_street, $t->address_postal_code.' '.$t->address_city])->filter()->implode(', ');

        $results = $this->resultGroups->map(fn ($g) => [
            'category' => $g['age_category'].' — '.$g['weight_category'],
            'participants' => collect($g['results'])->map(fn ($r) => [
                'name' => $r['name'],
                'result' => $r['result'] ?? '-',
                'notes' => $r['notes'] ?? null,
            ])->all(),
        ])->all();

        return [
            'icon' => '🏆',
            'title' => 'Toernooiverslag',
            'message' => $t->name.' — '.$totalResults.' resultaten',
            'tournament_id' => $t->id,
            'detail' => [
                'tournament_name' => $t->name,
                'date' => $t->tournament_date->format('d/m/Y'),
                'address' => $address ?: null,
                'results' => $results,
                'body' => 'Hieronder de resultaten van '.$t->name.'.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        $totalResults = $this->resultGroups->sum(fn ($g) => count($g['results']));

        return [
            'title' => 'Toernooiverslag',
            'body' => $this->tournament->name.' — '.$totalResults.' resultaten',
            'url' => '/',
        ];
    }
}
