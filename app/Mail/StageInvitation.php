<?php

namespace App\Mail;

use App\Models\ClubSettings;
use App\Models\Member;
use App\Models\Stage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StageInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Stage $stage,
        public Member $member,
        public string $token,
        public ?string $paymentUrl = null,
        public ?float $entryFee = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Uitnodiging: '.$this->stage->name,
        );
    }

    public function content(): Content
    {
        $this->stage->load('attachments');

        return new Content(
            view: 'emails.stage-invitation',
            with: [
                'stage' => $this->stage,
                'member' => $this->member,
                'acceptUrl' => url("/stages/rsvp/{$this->token}/accept"),
                'declineUrl' => url("/stages/rsvp/{$this->token}/decline"),
                'club' => ClubSettings::current(),
                'paymentUrl' => $this->paymentUrl,
                'entryFee' => $this->entryFee,
            ],
        );
    }
}
