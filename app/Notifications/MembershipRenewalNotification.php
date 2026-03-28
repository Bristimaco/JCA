<?php

namespace App\Notifications;

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
        return [
            'icon' => '💳',
            'title' => 'Lidmaatschap vernieuwing',
            'message' => $this->member->fullName().' — vernieuwingsdatum: '.$this->member->membership_renewal_date->format('d/m/Y'),
            'member_id' => $this->member->id,
        ];
    }
}
