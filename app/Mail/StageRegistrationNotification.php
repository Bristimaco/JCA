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

class StageRegistrationNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Stage $stage,
        public Member $member,
        public bool $registered,
    ) {}

    public function envelope(): Envelope
    {
        $action = $this->registered ? 'Ingeschreven' : 'Uitgeschreven';

        return new Envelope(
            subject: $action.': '.$this->stage->name,
        );
    }

    public function content(): Content
    {
        $ageCategory = $this->member->calculateAgeCategory(
            $this->stage->country_code,
            $this->stage->start_date,
        );

        $this->member->load('weightCategory.ageCategory');
        $wc = $this->member->weightCategory;
        $weightCategory = $wc
            ? ($wc->ageCategory?->name ? $wc->ageCategory->name.' — '.$wc->max_weight_kg.'kg' : $wc->max_weight_kg.'kg')
            : null;

        return new Content(
            view: 'emails.stage-registration',
            with: [
                'stage' => $this->stage,
                'member' => $this->member,
                'registered' => $this->registered,
                'ageCategory' => $ageCategory?->name,
                'weightCategory' => $weightCategory,
                'club' => ClubSettings::current(),
            ],
        );
    }
}
