<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\ClubSettings;
use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipRenewalNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Member $member,
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
            ->subject('Herinnering: Vernieuwing lidmaatschap')
            ->view('emails.membership-renewal-reminder', [
                'member' => $this->member,
                'renewalDate' => $this->member->membership_renewal_date,
                'club' => $club,
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        $club = ClubSettings::current();

        return [
            'icon' => '💳',
            'title' => 'Lidmaatschap vernieuwing',
            'message' => $this->member->fullName().' — vernieuwingsdatum: '.$this->member->membership_renewal_date->format('d/m/Y'),
            'member_id' => $this->member->id,
            'detail' => [
                'member_name' => $this->member->fullName(),
                'renewal_date' => $this->member->membership_renewal_date->format('d/m/Y'),
                'club_name' => $club->name,
                'body' => 'Dit is een herinnering dat het lidmaatschap van '.$this->member->fullName().' bij '.$club->name.' binnenkort vernieuwd moet worden. Gelieve het lidgeld tijdig te betalen.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => 'Lidmaatschap vernieuwing',
            'body' => $this->member->fullName().' — vernieuwingsdatum: '.$this->member->membership_renewal_date->format('d/m/Y'),
            'url' => '/',
        ];
    }
}
