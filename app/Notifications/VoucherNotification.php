<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\ClubSettings;
use App\Models\Voucher;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VoucherNotification extends Notification
{
    use Queueable;

    /** @param  Voucher[]  $vouchers */
    public function __construct(
        public array $vouchers,
    ) {
    }

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
        $club = ClubSettings::current();
        $count = count($this->vouchers);

        $mail = (new MailMessage)
            ->subject('Jouw voucher' . ($count > 1 ? 's' : '') . ' voor clubkledij — ' . $club->name)
            ->greeting("Hallo {$notifiable->name},")
            ->line('Bedankt voor de vernieuwing van het lidmaatschap! Als bedankje ontvang je ' . ($count > 1 ? $count . ' vouchers' : 'een voucher') . ' voor een gratis t-shirt of hoodie (mits toeslag) van de club.');

        foreach ($this->vouchers as $voucher) {
            $mail->line('**' . $voucher->member->fullName() . '**: code **' . $voucher->code . '** (geldig tot ' . $voucher->expires_at->format('d/m/Y') . ')');
        }

        $mail->line('Toon deze code (of de QR-code op de "Mijn Leden" pagina) aan een beheerder of trainer om je voucher in te wisselen.');

        return $mail;
    }

    public function toDatabase(object $notifiable): array
    {
        $club = ClubSettings::current();
        $count = count($this->vouchers);

        $voucherDetails = collect($this->vouchers)->map(fn(Voucher $v) => [
            'member_name' => $v->member->fullName(),
            'code' => $v->code,
            'expires_at' => $v->expires_at->format('d/m/Y'),
        ])->all();

        return [
            'icon' => '🎟️',
            'title' => 'Voucher' . ($count > 1 ? 's' : '') . ' ontvangen',
            'message' => $count . ' voucher' . ($count > 1 ? 's' : '') . ' voor clubkledij',
            'detail' => [
                'club_name' => $club->name,
                'voucher_count' => $count,
                'vouchers' => $voucherDetails,
                'body' => 'Je hebt ' . ($count > 1 ? $count . ' vouchers' : 'een voucher') . ' ontvangen voor een gratis t-shirt of hoodie (mits toeslag) van ' . $club->name . '. Toon de code aan een beheerder of trainer om je voucher in te wisselen.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        $count = count($this->vouchers);

        return [
            'title' => 'Voucher' . ($count > 1 ? 's' : '') . ' ontvangen',
            'body' => $count . ' voucher' . ($count > 1 ? 's' : '') . ' voor clubkledij beschikbaar',
            'url' => '/mijn-leden',
        ];
    }
}
