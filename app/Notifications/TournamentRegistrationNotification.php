<?php

namespace App\Notifications;

use App\Models\ClubSettings;
use App\Models\Member;
use App\Models\Tournament;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TournamentRegistrationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Tournament $tournament,
        public Member $member,
        public bool $registered,
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
        $action = $this->registered ? 'Ingeschreven' : 'Uitgeschreven';
        $ageCategory = $this->member->calculateAgeCategory(
            $this->tournament->country_code,
            $this->tournament->tournament_date,
        );

        $this->member->load('weightCategory.ageCategory');
        $wc = $this->member->weightCategory;
        $weightCategory = $wc
            ? ($wc->ageCategory?->name ? $wc->ageCategory->name.' — '.$wc->max_weight_kg.'kg' : $wc->max_weight_kg.'kg')
            : null;

        $club = ClubSettings::current();

        return (new MailMessage)
            ->subject($action.': '.$this->tournament->name)
            ->view('emails.tournament-registration', [
                'tournament' => $this->tournament,
                'member' => $this->member,
                'registered' => $this->registered,
                'ageCategory' => $ageCategory?->name,
                'weightCategory' => $weightCategory,
                'club' => $club,
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        $action = $this->registered ? 'ingeschreven voor' : 'uitgeschreven van';

        return [
            'icon' => $this->registered ? '✅' : '❌',
            'title' => $this->registered ? 'Ingeschreven' : 'Uitgeschreven',
            'message' => $this->member->fullName().' is '.$action.' '.$this->tournament->name,
            'tournament_id' => $this->tournament->id,
            'member_id' => $this->member->id,
            'registered' => $this->registered,
        ];
    }
}
