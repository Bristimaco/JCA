<?php

namespace App\Http\Controllers;

use App\Services\MolliePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StagePaymentWebhookController extends Controller
{
    public function __invoke(Request $request, MolliePaymentService $mollieService): Response
    {
        $paymentId = $request->input('id');

        if (! $paymentId) {
            return response('', 200);
        }

        $pivot = DB::table('member_stage')
            ->where('mollie_payment_id', $paymentId)
            ->first();

        if (! $pivot) {
            return response('', 200);
        }

        try {
            $mollieService->syncStagePaymentStatus($pivot->id);
        } catch (\Throwable $e) {
            Log::error('Stage betaling webhook mislukt', [
                'payment_id' => $paymentId,
                'pivot_id' => $pivot->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response('', 200);
    }
}
