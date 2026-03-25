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

class TournamentTrainerNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Tournament $tournament,
        public Collection $participants,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Trainer info: '.$this->tournament->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.tournament-trainer-notification',
            with: [
                'tournament' => $this->tournament,
                'participants' => $this->participants,
                'club' => ClubSettings::current(),
            ],
        );
    }
}
