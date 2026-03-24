<?php

namespace App\Mail;

use App\Models\ClubSettings;
use App\Models\Tournament;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class TournamentReport extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Tournament $tournament,
        public Collection $resultGroups,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Toernooiverslag: '.$this->tournament->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.tournament-report',
            with: [
                'tournament' => $this->tournament,
                'resultGroups' => $this->resultGroups,
                'club' => ClubSettings::current(),
            ],
        );
    }
}
