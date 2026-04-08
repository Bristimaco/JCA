<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\ClubSettings;
use App\Models\Member;
use App\Models\Stage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StageRegistrationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Stage $stage,
        public Member $member,
        public bool $registered,
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
        $action = $this->registered ? 'Ingeschreven' : 'Uitgeschreven';
        $ageCategory = $this->member->calculateAgeCategory(
            $this->stage->country_code,
            $this->stage->start_date,
        );

        $this->member->load('weightCategory.ageCategory');
        $wc = $this->member->weightCategory;
        $weightCategory = $wc
            ? ($wc->ageCategory?->name ? $wc->ageCategory->name.' — '.$wc->max_weight_kg.'kg' : $wc->max_weight_kg.'kg')
            : null;

        $club = ClubSettings::current();

        return (new MailMessage)
            ->subject($action.': '.$this->stage->name)
            ->view('emails.stage-registration', [
                'stage' => $this->stage,
                'member' => $this->member,
                'registered' => $this->registered,
                'ageCategory' => $ageCategory?->name,
                'weightCategory' => $weightCategory,
                'club' => $club,
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        $action = $this->registered ? 'ingeschreven voor' : 'uitgeschreven van';
        $s = $this->stage;
        $address = collect([$s->address_street, $s->address_postal_code.' '.$s->address_city])->filter()->implode(', ');

        $ageCategory = $this->member->calculateAgeCategory(
            $s->country_code,
            $s->start_date,
        );
        $this->member->load('weightCategory.ageCategory');
        $wc = $this->member->weightCategory;
        $weightCategory = $wc
            ? ($wc->ageCategory?->name ? $wc->ageCategory->name.' — '.$wc->max_weight_kg.'kg' : $wc->max_weight_kg.'kg')
            : null;

        return [
            'icon' => $this->registered ? '✅' : '❌',
            'title' => $this->registered ? 'Ingeschreven' : 'Uitgeschreven',
            'message' => $this->member->fullName().' is '.$action.' '.$s->name,
            'stage_id' => $s->id,
            'member_id' => $this->member->id,
            'registered' => $this->registered,
            'detail' => [
                'member_name' => $this->member->fullName(),
                'stage_name' => $s->name,
                'start_date' => $s->start_date->format('d/m/Y'),
                'end_date' => $s->end_date->format('d/m/Y'),
                'address' => $address ?: null,
                'age_category' => $this->registered ? $ageCategory?->name : null,
                'weight_category' => $this->registered ? $weightCategory : null,
                'body' => $this->member->fullName().' is '.($this->registered ? 'succesvol ingeschreven voor' : 'uitgeschreven van').' '.$s->name.'.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        $action = $this->registered ? 'ingeschreven voor' : 'uitgeschreven van';

        return [
            'title' => $this->registered ? 'Ingeschreven' : 'Uitgeschreven',
            'body' => $this->member->fullName().' is '.$action.' '.$this->stage->name,
            'url' => '/',
        ];
    }
}
