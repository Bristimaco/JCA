<?php

namespace App\Mail;

use App\Models\ClubSettings;
use App\Models\Stage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class StageTrainerNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Stage $stage,
        public Collection $participants,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Trainer info: '.$this->stage->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.stage-trainer-notification',
            with: [
                'stage' => $this->stage,
                'participants' => $this->participants,
                'club' => ClubSettings::current(),
            ],
        );
    }
}
