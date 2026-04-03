<?php

namespace App\Http\Controllers;

use App\Models\BarOrder;
use Inertia\Inertia;
use Inertia\Response;

class MijnPoefController extends Controller
{
    public function index(): Response
    {
        $orders = BarOrder::unpaidPoef()
            ->where('ordered_by_user_id', auth()->id())
            ->with('items.product:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (BarOrder $order) => [
                'id' => $order->id,
                'total' => $order->total,
                'created_at' => $order->created_at->toIso8601String(),
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'product_name' => $item->product?->name ?? 'Product',
                ]),
            ]);

        $total = $orders->sum('total');

        return Inertia::render('MijnPoef', [
            'orders' => $orders,
            'total' => $total,
        ]);
    }
}
