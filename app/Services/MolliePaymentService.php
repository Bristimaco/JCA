<?php

namespace App\Services;

use App\Enums\InvitationStatus;
use App\Enums\InvoiceStatus;
use App\Enums\VoucherStatus;
use App\Models\ClubSettings;
use App\Models\EventRegistration;
use App\Models\MembershipInvoice;
use App\Models\Voucher;
use App\Notifications\PaymentConfirmationNotification;
use App\Notifications\VoucherNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Mollie\Laravel\Facades\Mollie;

class MolliePaymentService
{
    public function createPaymentLink(MembershipInvoice $invoice, string $description): MembershipInvoice
    {
        try {
            $expiryDays = ClubSettings::current()->mollie_expiry_days ?? 14;

            $payment = Mollie::api()->paymentLinks->create([
                'amount' => [
                    'currency' => 'EUR',
                    'value' => number_format($invoice->total_amount, 2, '.', ''),
                ],
                'description' => $description,
                'redirectUrl' => url('/'),
                'webhookUrl' => url('/webhooks/mollie'),
                'expiresAt' => now()->addDays($expiryDays)->toIso8601String(),
            ]);

            $invoice->update([
                'mollie_payment_id' => $payment->id,
                'mollie_payment_url' => $payment->getCheckoutUrl(),
            ]);

            Log::info('Mollie betaallink aangemaakt', [
                'invoice_id' => $invoice->id,
                'mollie_id' => $payment->id,
            ]);
        } catch (\Throwable $e) {
            Log::error('Mollie betaallink aanmaken mislukt', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
            ]);
        }

        return $invoice;
    }

    public function deletePaymentLink(string $paymentLinkId): void
    {
        try {
            Mollie::api()->paymentLinks->delete($paymentLinkId);

            Log::info('Mollie betaallink verwijderd', ['mollie_id' => $paymentLinkId]);
        } catch (\Throwable $e) {
            Log::warning('Mollie betaallink verwijderen mislukt', [
                'mollie_id' => $paymentLinkId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function getPaymentStatus(string $paymentLinkId): string
    {
        $paymentLink = Mollie::api()->paymentLinks->get($paymentLinkId);

        if ($paymentLink->isPaid()) {
            return InvoiceStatus::Paid->value;
        }

        if ($paymentLink->expiresAt && now()->greaterThan($paymentLink->expiresAt)) {
            return InvoiceStatus::Expired->value;
        }

        return InvoiceStatus::Pending->value;
    }

    public function syncInvoiceStatus(MembershipInvoice $invoice): ?string
    {
        if (! $invoice->mollie_payment_id) {
            return null;
        }

        $newStatus = $this->getPaymentStatus($invoice->mollie_payment_id);
        $invoice->update(['status' => $newStatus]);

        if ($newStatus === InvoiceStatus::Paid->value && ! $invoice->paid_at) {
            $invoice->update(['paid_at' => now()]);

            foreach ($invoice->lines as $line) {
                if ($line->member) {
                    $line->member->update([
                        'membership_renewal_date' => $line->member->membership_renewal_date->addYear(),
                        'membership_fee_reminded_at' => null,
                    ]);
                }
            }

            $invoice->load('lines.member', 'lines.trainingGroup');
            $invoice->user->notify(new PaymentConfirmationNotification($invoice));

            // Create vouchers for each member on the invoice
            $vouchers = [];
            foreach ($invoice->lines as $line) {
                if ($line->member) {
                    $vouchers[] = Voucher::create([
                        'member_id' => $line->member->id,
                        'invoice_id' => $invoice->id,
                        'code' => Voucher::generateCode(),
                        'status' => VoucherStatus::Active,
                        'expires_at' => $line->member->membership_renewal_date,
                    ]);
                }
            }

            if (count($vouchers) > 0) {
                $invoice->user->notify(new VoucherNotification($vouchers));
            }
        }

        return $newStatus;
    }

    public function createTournamentPaymentLink(int $pivotId, float $amount, string $description, string $redirectUrl): void
    {
        try {
            $expiryDays = ClubSettings::current()->mollie_expiry_days ?? 14;

            $payment = Mollie::api()->paymentLinks->create([
                'amount' => [
                    'currency' => 'EUR',
                    'value' => number_format($amount, 2, '.', ''),
                ],
                'description' => $description,
                'redirectUrl' => $redirectUrl,
                'webhookUrl' => url('/webhooks/mollie/tournament'),
                'expiresAt' => now()->addDays($expiryDays)->toIso8601String(),
            ]);

            DB::table('member_tournament')
                ->where('id', $pivotId)
                ->update([
                    'mollie_payment_id' => $payment->id,
                    'mollie_payment_url' => $payment->getCheckoutUrl(),
                    'payment_status' => 'pending',
                ]);

            Log::info('Toernooi betaallink aangemaakt', [
                'pivot_id' => $pivotId,
                'mollie_id' => $payment->id,
            ]);
        } catch (\Throwable $e) {
            Log::error('Toernooi betaallink aanmaken mislukt', [
                'pivot_id' => $pivotId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function syncTournamentPaymentStatus(int $pivotId): ?string
    {
        $pivot = DB::table('member_tournament')->where('id', $pivotId)->first();

        if (! $pivot || ! $pivot->mollie_payment_id) {
            return null;
        }

        try {
            $paymentLink = Mollie::api()->paymentLinks->get($pivot->mollie_payment_id);

            $status = 'pending';
            if ($paymentLink->isPaid()) {
                $status = 'paid';
            } elseif ($paymentLink->expiresAt && now()->greaterThan($paymentLink->expiresAt)) {
                $status = 'expired';
            }

            $update = ['payment_status' => $status];

            if ($status === 'paid' && $pivot->invitation_status !== InvitationStatus::Accepted->value) {
                $update['invitation_status'] = InvitationStatus::Accepted->value;
                $update['responded_at'] = now();
            }

            DB::table('member_tournament')->where('id', $pivotId)->update($update);

            Log::info('Toernooi betaalstatus gesynchroniseerd', [
                'pivot_id' => $pivotId,
                'status' => $status,
            ]);

            return $status;
        } catch (\Throwable $e) {
            Log::error('Toernooi betaalstatus sync mislukt', [
                'pivot_id' => $pivotId,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    public function createEventPaymentLink(EventRegistration $registration, string $description, string $redirectUrl): void
    {
        try {
            $expiryDays = ClubSettings::current()->mollie_expiry_days ?? 14;

            $payment = Mollie::api()->paymentLinks->create([
                'amount' => [
                    'currency' => 'EUR',
                    'value' => number_format($registration->total_amount, 2, '.', ''),
                ],
                'description' => $description,
                'redirectUrl' => $redirectUrl,
                'webhookUrl' => url('/webhooks/mollie/event'),
                'expiresAt' => now()->addDays($expiryDays)->toIso8601String(),
            ]);

            $registration->update([
                'mollie_payment_id' => $payment->id,
                'mollie_payment_url' => $payment->getCheckoutUrl(),
                'payment_status' => 'pending',
            ]);

            Log::info('Evenement betaallink aangemaakt', [
                'registration_id' => $registration->id,
                'mollie_id' => $payment->id,
            ]);
        } catch (\Throwable $e) {
            Log::error('Evenement betaallink aanmaken mislukt', [
                'registration_id' => $registration->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function syncEventPaymentStatus(EventRegistration $registration): ?string
    {
        if (! $registration->mollie_payment_id) {
            return null;
        }

        try {
            $paymentLink = Mollie::api()->paymentLinks->get($registration->mollie_payment_id);

            $status = 'pending';
            if ($paymentLink->isPaid()) {
                $status = 'paid';
            } elseif ($paymentLink->expiresAt && now()->greaterThan($paymentLink->expiresAt)) {
                $status = 'expired';
            }

            $update = ['payment_status' => $status];

            if ($status === 'paid' && ! $registration->paid_at) {
                $update['paid_at'] = now();
            }

            $registration->update($update);

            Log::info('Evenement betaalstatus gesynchroniseerd', [
                'registration_id' => $registration->id,
                'status' => $status,
            ]);

            return $status;
        } catch (\Throwable $e) {
            Log::error('Evenement betaalstatus sync mislukt', [
                'registration_id' => $registration->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
