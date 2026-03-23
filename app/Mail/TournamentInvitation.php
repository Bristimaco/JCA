<?php

namespace App\Mail;

use App\Models\Member;
use App\Models\Tournament;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TournamentInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Tournament $tournament,
        public Member $member,
        public string $token,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Uitnodiging: ' . $this->tournament->name,
        );
    }

    public function content(): Content
    {
        $this->tournament->load('attachments');

        return new Content(
            view: 'emails.tournament-invitation',
            with: [
                'tournament' => $this->tournament,
                'member' => $this->member,
                'acceptUrl' => url("/tournaments/rsvp/{$this->token}/accept"),
                'declineUrl' => url("/tournaments/rsvp/{$this->token}/decline"),
            ],
        );
    }
}
