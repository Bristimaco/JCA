<?php

namespace App\Http\Controllers;

use App\Models\BarOrder;
use App\Models\User;
use App\Services\MolliePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PoefController extends Controller
{
    public function index(): Response
    {
        $poefOrders = BarOrder::unpaidPoef()
            ->with(['items.product:id,name', 'orderedBy:id,name'])
            ->orderBy('created_at', 'asc')
            ->get();

        $grouped = $poefOrders->groupBy('ordered_by_user_id')->map(function ($orders, $userId) {
            $user = $orders->first()->orderedBy;

            return [
                'user_id' => $userId,
                'user_name' => $user?->name ?? 'Onbekend',
                'total' => $orders->sum('total'),
                'orders' => $orders,
            ];
        })->values();

        return Inertia::render('POS/Poef', [
            'poefUsers' => $grouped,
        ]);
    }

    public function createQr(Request $request, MolliePaymentService $mollieService): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $userId = $request->input('user_id');
        $user = User::findOrFail($userId);

        $total = BarOrder::unpaidPoef()
            ->where('ordered_by_user_id', $userId)
            ->sum('total');

        if ($total <= 0) {
            return response()->json(['error' => 'Geen openstaand poef-bedrag.'], 422);
        }

        try {
            $description = 'Poef betaling '.$user->name;
            $result = $mollieService->createBancontactQrPayment((float) $total, $description, [
                'type' => 'poef',
                'user_id' => $userId,
            ]);

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('Poef QR betaling aanmaken mislukt', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Betaling aanmaken mislukt'], 500);
        }
    }

    public function markPaid(Request $request): RedirectResponse
    {
        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'payment_method' => ['nullable', 'string'],
            'mollie_payment_id' => ['nullable', 'string'],
        ]);

        $userId = $request->input('user_id');

        BarOrder::unpaidPoef()
            ->where('ordered_by_user_id', $userId)
            ->update([
                'status' => 'paid',
                'payment_method' => $request->input('payment_method', 'other'),
                'payment_status' => 'paid',
                'paid_at' => now(),
                'mollie_payment_id' => $request->input('mollie_payment_id'),
            ]);

        return back()->with('status', 'Poef betaling verwerkt.');
    }
}
