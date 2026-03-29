<?php

namespace App\Services;

use App\Enums\InvoiceStatus;
use App\Enums\VoucherStatus;
use App\Models\MembershipInvoice;
use App\Models\Voucher;
use App\Notifications\PaymentConfirmationNotification;
use App\Notifications\VoucherNotification;
use Illuminate\Support\Facades\Log;
use Mollie\Laravel\Facades\Mollie;

class MolliePaymentService
{
    public function createPaymentLink(MembershipInvoice $invoice, string $description): MembershipInvoice
    {
        try {
            $payment = Mollie::api()->paymentLinks->create([
                'amount' => [
                    'currency' => 'EUR',
                    'value' => number_format($invoice->total_amount, 2, '.', ''),
                ],
                'description' => $description,
                'redirectUrl' => url('/'),
                'webhookUrl' => url('/webhooks/mollie'),
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
        if (!$invoice->mollie_payment_id) {
            return null;
        }

        $newStatus = $this->getPaymentStatus($invoice->mollie_payment_id);
        $invoice->update(['status' => $newStatus]);

        if ($newStatus === InvoiceStatus::Paid->value && !$invoice->paid_at) {
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
}
