<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\ClubSettings;
use App\Models\MembershipInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentConfirmationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public MembershipInvoice $invoice,
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

        return (new MailMessage)
            ->subject('Betaling ontvangen — Lidgeld ' . $this->invoice->year)
            ->greeting("Hallo {$notifiable->name},")
            ->line('Uw betaling van €' . number_format($this->invoice->total_amount, 2, ',', '.') . " voor het lidgeld {$this->invoice->year} bij {$club->name} is ontvangen.")
            ->line('De vernieuwingsdatum van de leden is automatisch verlengd met een jaar.')
            ->line('Bedankt voor uw betaling!');
    }

    public function toDatabase(object $notifiable): array
    {
        $club = ClubSettings::current();
        $lines = $this->invoice->lines;

        $memberNames = $lines->map(fn($line) => $line->member?->fullName() ?? 'Onbekend')->join(', ');

        return [
            'icon' => '✅',
            'title' => 'Betaling ontvangen',
            'message' => "Lidgeld {$this->invoice->year} — €" . number_format($this->invoice->total_amount, 2, ',', '.') . ' betaald',
            'invoice_id' => $this->invoice->id,
            'detail' => [
                'club_name' => $club->name,
                'year' => $this->invoice->year,
                'total_amount' => number_format($this->invoice->total_amount, 2, ',', '.'),
                'paid_at' => $this->invoice->paid_at?->format('d/m/Y H:i'),
                'member_names' => $memberNames,
                'body' => 'Uw betaling van €' . number_format($this->invoice->total_amount, 2, ',', '.') . ' voor het lidgeld ' . $this->invoice->year . ' bij ' . $club->name . ' is ontvangen. De vernieuwingsdatum van de leden is automatisch verlengd.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => 'Betaling ontvangen',
            'body' => "Lidgeld {$this->invoice->year} — €" . number_format($this->invoice->total_amount, 2, ',', '.') . ' betaald',
            'url' => '/',
        ];
    }
}
