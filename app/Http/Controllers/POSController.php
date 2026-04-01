<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\BarOrder;
use App\Models\BarProduct;
use App\Models\User;
use App\Notifications\BarProductRefillNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:bar_products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $order = DB::transaction(function () use ($request) {
            $items = collect($request->input('items'));
            $productIds = $items->pluck('product_id');
            $products = BarProduct::whereIn('id', $productIds)->get()->keyBy('id');

            $total = $items->sum(fn ($item) => $products[$item['product_id']]->price * $item['quantity']);

            $order = BarOrder::create([
                'total' => $total,
                'user_id' => $request->user()->id,
            ]);

            foreach ($items as $item) {
                $order->items()->create([
                    'bar_product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $products[$item['product_id']]->price,
                ]);
            }

            return $order;
        });

        return response()->json(['success' => true, 'order_id' => $order->id]);
    }

    public function toggleRefill(BarProduct $barProduct): JsonResponse
    {
        $barProduct->update([
            'needs_refill' => ! $barProduct->needs_refill,
            'needs_refill_at' => ! $barProduct->needs_refill ? now() : null,
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
