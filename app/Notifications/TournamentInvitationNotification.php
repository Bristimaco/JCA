<?php

namespace App\Notifications;

use App\Models\ClubSettings;
use App\Models\Member;
use App\Models\Tournament;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TournamentInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Tournament $tournament,
        public Member $member,
        public string $token,
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
        $this->tournament->load('attachments');
        $club = ClubSettings::current();

        return (new MailMessage)
            ->subject('Uitnodiging: '.$this->tournament->name)
            ->view('emails.tournament-invitation', [
                'tournament' => $this->tournament,
                'member' => $this->member,
                'acceptUrl' => url("/tournaments/rsvp/{$this->token}/accept"),
                'declineUrl' => url("/tournaments/rsvp/{$this->token}/decline"),
                'club' => $club,
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'icon' => '📩',
            'title' => 'Toernooi uitnodiging',
            'message' => 'Uitnodiging voor '.$this->member->fullName().' — '.$this->tournament->name.' ('.$this->tournament->tournament_date->format('d/m/Y').')',
            'tournament_id' => $this->tournament->id,
            'member_id' => $this->member->id,
            'accept_url' => url("/tournaments/rsvp/{$this->token}/accept"),
            'decline_url' => url("/tournaments/rsvp/{$this->token}/decline"),
        ];
    }
}
