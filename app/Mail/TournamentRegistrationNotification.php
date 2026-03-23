<?php

namespace App\Mail;

use App\Models\Member;
use App\Models\Tournament;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TournamentRegistrationNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Tournament $tournament,
        public Member $member,
        public bool $registered,
    ) {
    }

    public function envelope(): Envelope
    {
        $action = $this->registered ? 'Ingeschreven' : 'Uitgeschreven';

        return new Envelope(
            subject: $action . ': ' . $this->tournament->name,
        );
    }

    public function content(): Content
    {
        $ageCategory = $this->member->calculateAgeCategory(
            $this->tournament->country_code,
            $this->tournament->tournament_date,
        );

        $this->member->load('weightCategory.ageCategory');
        $wc = $this->member->weightCategory;
        $weightCategory = $wc
            ? ($wc->ageCategory?->name ? $wc->ageCategory->name . ' — ' . $wc->max_weight_kg . 'kg' : $wc->max_weight_kg . 'kg')
            : null;

        return new Content(
            view: 'emails.tournament-registration',
            with: [
                'tournament' => $this->tournament,
                'member' => $this->member,
                'registered' => $this->registered,
                'ageCategory' => $ageCategory?->name,
                'weightCategory' => $weightCategory,
            ],
        );
    }
}
