<?php

namespace App\Notifications;

use App\Channels\WebPushChannel;
use App\Models\ClubSettings;
use App\Models\MembershipInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipPaymentNotification extends Notification
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
        $lines = $this->invoice->lines;

        $mail = (new MailMessage)
            ->subject("Lidgeld {$this->invoice->year} — €" . number_format($this->invoice->total_amount, 2, ',', '.'))
            ->greeting("Hallo {$notifiable->name},")
            ->line("Hierbij uw factuur voor het lidgeld {$this->invoice->year} bij {$club->name}.")
            ->line('');

        foreach ($lines as $line) {
            $memberName = $line->member?->fullName() ?? 'Onbekend lid';
            $groupName = $line->trainingGroup?->name ?? '-';
            $label = $line->is_discounted ? ' (korting)' : '';
            $mail->line("• {$memberName} — {$groupName}: €" . number_format($line->amount, 2, ',', '.') . "{$label}");
        }

        $mail->line('')
            ->line('**Totaal: €' . number_format($this->invoice->total_amount, 2, ',', '.') . '**');

        if ($this->invoice->mollie_payment_url) {
            $mail->action('Nu betalen', $this->invoice->mollie_payment_url);
        }

        $mail->line('Gelieve te betalen vóór ' . ($this->invoice->due_date?->format('d/m/Y') ?? '-') . '.');

        return $mail;
    }

    public function toDatabase(object $notifiable): array
    {
        $club = ClubSettings::current();
        $lines = $this->invoice->lines;

        $lineDetails = $lines->map(fn($line) => [
            'member_name' => $line->member?->fullName() ?? 'Onbekend lid',
            'group_name' => $line->trainingGroup?->name ?? '-',
            'amount' => number_format($line->amount, 2, ',', '.'),
            'is_discounted' => $line->is_discounted,
        ])->values()->all();

        return [
            'icon' => '💶',
            'title' => "Lidgeld {$this->invoice->year}",
            'message' => 'Totaal: €' . number_format($this->invoice->total_amount, 2, ',', '.') . ' — ' . count($lineDetails) . ' ' . ((count($lineDetails) === 1) ? 'lid' : 'leden'),
            'invoice_id' => $this->invoice->id,
            'detail' => [
                'club_name' => $club->name,
                'year' => $this->invoice->year,
                'total_amount' => number_format($this->invoice->total_amount, 2, ',', '.'),
                'due_date' => $this->invoice->due_date?->format('d/m/Y'),
                'payment_url' => $this->invoice->mollie_payment_url,
                'status' => $this->invoice->status->value,
                'lines' => $lineDetails,
                'body' => "Factuur voor het lidgeld {$this->invoice->year} bij {$club->name}. Gelieve te betalen vóór " . ($this->invoice->due_date?->format('d/m/Y') ?? '-') . '.',
            ],
        ];
    }

    public function toWebPush(object $notifiable): array
    {
        return [
            'title' => "Lidgeld {$this->invoice->year}",
            'body' => 'Totaal: €' . number_format($this->invoice->total_amount, 2, ',', '.'),
            'url' => '/',
        ];
    }
}
