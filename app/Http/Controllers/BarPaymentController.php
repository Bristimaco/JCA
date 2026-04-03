<?php

namespace App\Http\Controllers;

use App\Models\BarOrder;
use App\Services\MolliePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class BarPaymentController extends Controller
{
    public function createQr(Request $request, MolliePaymentService $mollieService): JsonResponse
    {
        $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:1500'],
            'order_id' => ['nullable', 'exists:bar_orders,id'],
        ]);

        $amount = (float) $request->input('amount');
        $orderId = $request->input('order_id');
        $description = 'Bar bestelling #'.($orderId ?? 'nieuw');

        try {
            $result = $mollieService->createBancontactQrPayment($amount, $description, [
                'order_id' => $orderId,
                'type' => 'bar',
            ]);

            if ($orderId) {
                BarOrder::where('id', $orderId)->update([
                    'mollie_payment_id' => $result['payment_id'],
                    'mollie_payment_url' => $result['checkout_url'],
                    'payment_method' => 'bancontact',
                    'payment_status' => 'pending',
                ]);
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('Bar QR betaling aanmaken mislukt', [
                'error' => $e->getMessage(),
                'amount' => $amount,
            ]);

            return response()->json(['error' => 'Betaling aanmaken mislukt'], 500);
        }
    }

    public function checkStatus(string $paymentId, MolliePaymentService $mollieService): JsonResponse
    {
        try {
            $status = $mollieService->getPaymentStatusById($paymentId);

            if ($status === 'paid') {
                $order = BarOrder::where('mollie_payment_id', $paymentId)->first();
                if ($order && $order->payment_status !== 'paid') {
                    $order->update([
                        'payment_status' => 'paid',
                        'paid_at' => now(),
                    ]);
                }
            }

            return response()->json(['status' => $status]);
        } catch (\Throwable $e) {
            Log::error('Bar betaalstatus ophalen mislukt', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['status' => 'unknown']);
        }
    }

    public function webhook(Request $request, MolliePaymentService $mollieService): Response
    {
        $paymentId = $request->input('id');

        if (! $paymentId) {
            return response('', 200);
        }

        try {
            $status = $mollieService->getPaymentStatusById($paymentId);

            $order = BarOrder::where('mollie_payment_id', $paymentId)->first();

            if ($order) {
                $update = ['payment_status' => $status];

                if ($status === 'paid' && ! $order->paid_at) {
                    $update['paid_at'] = now();
                }

                $order->update($update);

                Log::info('Bar betaalstatus via webhook bijgewerkt', [
                    'order_id' => $order->id,
                    'status' => $status,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Bar webhook verwerking mislukt', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);
        }

        return response('', 200);
    }
}
