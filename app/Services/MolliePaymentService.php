<?php

namespace App\Services;

use App\Enums\InvoiceStatus;
use App\Models\MembershipInvoice;
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

    public function getPaymentStatus(string $paymentId): string
    {
        $payment = Mollie::api()->payments->get($paymentId);

        return match (true) {
            $payment->isPaid() => InvoiceStatus::Paid->value,
            $payment->isExpired() => InvoiceStatus::Expired->value,
            $payment->isFailed(), $payment->isCanceled() => InvoiceStatus::Failed->value,
            default => InvoiceStatus::Pending->value,
        };
    }
}
