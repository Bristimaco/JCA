<?php

namespace App\Http\Controllers;

use App\Enums\InvoiceStatus;
use App\Models\MembershipInvoice;
use App\Notifications\PaymentConfirmationNotification;
use App\Services\MolliePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MollieWebhookController extends Controller
{
    public function __invoke(Request $request, MolliePaymentService $mollieService): Response
    {
        $paymentId = $request->input('id');

        if (!$paymentId) {
            return response('', 200);
        }

        $invoice = MembershipInvoice::where('mollie_payment_id', $paymentId)->first();

        if (!$invoice) {
            return response('', 200);
        }

        $newStatus = $mollieService->getPaymentStatus($paymentId);
        $invoice->update(['status' => $newStatus]);

        if ($newStatus === InvoiceStatus::Paid->value && !$invoice->paid_at) {
            $invoice->update(['paid_at' => now()]);

            // Extend renewal date for all members on the invoice
            foreach ($invoice->lines as $line) {
                if ($line->member) {
                    $line->member->update([
                        'membership_renewal_date' => $line->member->membership_renewal_date->addYear(),
                        'membership_fee_reminded_at' => null,
                    ]);
                }
            }

            // Notify the payer
            $invoice->load('lines.member', 'lines.trainingGroup');
            $invoice->user->notify(new PaymentConfirmationNotification($invoice));
        }

        return response('', 200);
    }
}
