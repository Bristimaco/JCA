<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\ClubSettings;
use App\Models\Member;
use App\Models\Stage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StageInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Stage $stage,
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
        $this->stage->load('attachments');
        $club = ClubSettings::current();

        return (new MailMessage)
            ->subject('Uitnodiging: '.$this->stage->name)
            ->view('emails.stage-invitation', [
                'stage' => $this->stage,
                'member' => $this->member,
                'acceptUrl' => url("/stages/rsvp/{$this->token}/accept"),
                'declineUrl' => url("/stages/rsvp/{$this->token}/decline"),
                'club' => $club,
                'paymentUrl' => $this->paymentUrl,
                'entryFee' => $this->entryFee,
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        $s = $this->stage;
        $address = collect([$s->address_street, $s->address_postal_code.' '.$s->address_city])->filter()->implode(', ');

        return [
            'icon' => '📩',
            'title' => 'Stage uitnodiging',
            'message' => 'Uitnodiging voor '.$this->member->fullName().' — '.$s->name.' ('.$s->start_date->format('d/m/Y').' - '.$s->end_date->format('d/m/Y').')',
            'stage_id' => $s->id,
            'member_id' => $this->member->id,
            'accept_url' => url("/stages/rsvp/{$this->token}/accept"),
            'decline_url' => url("/stages/rsvp/{$this->token}/decline"),
            'payment_url' => $this->paymentUrl,
            'entry_fee' => $this->entryFee,
            'detail' => [
                'member_name' => $this->member->fullName(),
                'stage_name' => $s->name,
                'start_date' => $s->start_date->format('d/m/Y'),
                'end_date' => $s->end_date->format('d/m/Y'),
                'rsvp_deadline' => $s->invitation_deadline?->format('d/m/Y'),
                'address' => $address ?: null,
                'body' => $this->member->fullName().' is uitgenodigd voor '.$s->name.'. Reageer vóór de deadline om deelname te bevestigen of af te wijzen.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => 'Stage uitnodiging',
            'body' => $this->member->fullName().' — '.$this->stage->name.' ('.$this->stage->start_date->format('d/m/Y').' - '.$this->stage->end_date->format('d/m/Y').')',
            'url' => '/',
        ];
    }
}
