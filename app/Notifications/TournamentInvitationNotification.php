<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
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
        public ?string $paymentUrl = null,
        public ?float $entryFee = null,
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
                'paymentUrl' => $this->paymentUrl,
                'entryFee' => $this->entryFee,
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        $t = $this->tournament;
        $address = collect([$t->address_street, $t->address_postal_code.' '.$t->address_city])->filter()->implode(', ');

        return [
            'icon' => '📩',
            'title' => 'Toernooi uitnodiging',
            'message' => 'Uitnodiging voor '.$this->member->fullName().' — '.$t->name.' ('.$t->tournament_date->format('d/m/Y').')',
            'tournament_id' => $t->id,
            'member_id' => $this->member->id,
            'accept_url' => url("/tournaments/rsvp/{$this->token}/accept"),
            'decline_url' => url("/tournaments/rsvp/{$this->token}/decline"),
            'payment_url' => $this->paymentUrl,
            'entry_fee' => $this->entryFee,
            'detail' => [
                'member_name' => $this->member->fullName(),
                'tournament_name' => $t->name,
                'date' => $t->tournament_date->format('d/m/Y'),
                'rsvp_deadline' => $t->invitation_deadline?->format('d/m/Y'),
                'address' => $address ?: null,
                'body' => $this->member->fullName().' is uitgenodigd voor '.$t->name.'. Reageer vóór de deadline om deelname te bevestigen of af te wijzen.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => 'Toernooi uitnodiging',
            'body' => $this->member->fullName().' — '.$this->tournament->name.' ('.$this->tournament->tournament_date->format('d/m/Y').')',
            'url' => '/',
        ];
    }
}
