<?php

namespace App\Mail;

use App\Models\ClubSettings;
use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MembershipRenewalReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Member $member,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Herinnering: Vernieuwing lidmaatschap',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.membership-renewal-reminder',
            with: [
                'member' => $this->member,
                'renewalDate' => $this->member->membership_renewal_date,
                'club' => ClubSettings::current(),
            ],
        );
    }
}
