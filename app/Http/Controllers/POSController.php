<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\BarProduct;
use App\Models\User;
use App\Notifications\BarProductRefillNotification;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class POSController extends Controller
{
    public function __invoke(): Response
    {
        $products = BarProduct::active()
            ->ordered()
            ->get(['id', 'name', 'price', 'needs_refill']);

        return Inertia::render('POS', [
            'products' => $products,
        ]);
    }

    public function toggleRefill(BarProduct $barProduct): JsonResponse
    {
        $barProduct->update([
            'needs_refill' => !$barProduct->needs_refill,
            'needs_refill_at' => !$barProduct->needs_refill ? now() : null,
        ]);

        if ($barProduct->needs_refill) {
            $admins = User::where('role', UserRole::Admin)->where('is_active', true)->get();
            foreach ($admins as $admin) {
                $admin->notify(new BarProductRefillNotification($barProduct));
            }
        }

        return response()->json([
            'needs_refill' => $barProduct->needs_refill,
        ]);
    }
}
