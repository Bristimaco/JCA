<?php

namespace App\Http\Controllers;

use App\Models\EventRegistration;
use App\Services\MolliePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class EventPaymentWebhookController extends Controller
{
    public function __invoke(Request $request, MolliePaymentService $mollieService): Response
    {
        $paymentId = $request->input('id');

        if (! $paymentId) {
            return response('', 200);
        }

        $registration = EventRegistration::where('mollie_payment_id', $paymentId)->first();

        if (! $registration) {
            return response('', 200);
        }

        try {
            $mollieService->syncEventPaymentStatus($registration);
        } catch (\Throwable $e) {
            Log::error('Evenement betaling webhook mislukt', [
                'payment_id' => $paymentId,
                'registration_id' => $registration->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response('', 200);
    }
}
