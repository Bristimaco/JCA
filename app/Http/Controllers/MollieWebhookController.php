<?php

namespace App\Http\Controllers;

use App\Models\MembershipInvoice;
use App\Services\MolliePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class MollieWebhookController extends Controller
{
    public function __invoke(Request $request, MolliePaymentService $mollieService): Response
    {
        $paymentId = $request->input('id');

        if (! $paymentId) {
            return response('', 200);
        }

        $invoice = MembershipInvoice::where('mollie_payment_id', $paymentId)->first();

        if (! $invoice) {
            return response('', 200);
        }

        try {
            $mollieService->syncInvoiceStatus($invoice);
        } catch (\Throwable $e) {
            Log::error('Mollie webhook verwerking mislukt', [
                'payment_id' => $paymentId,
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response('', 200);
    }
}
