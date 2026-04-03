<?php

namespace App\Http\Controllers;

use App\Models\BarCategory;
use App\Models\BarOrder;
use App\Models\BarProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BarOrderController extends Controller
{
    public function index(): Response
    {
        $products = BarProduct::active()
            ->ordered()
            ->get(['id', 'name', 'price', 'bar_category_id']);

        $categories = BarCategory::ordered()->get(['id', 'name']);

        return Inertia::render('Bestelling', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:bar_products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($request) {
            $items = collect($request->input('items'));
            $productIds = $items->pluck('product_id');
            $products = BarProduct::whereIn('id', $productIds)->get()->keyBy('id');

            $total = $items->sum(fn ($item) => $products[$item['product_id']]->price * $item['quantity']);

            $order = BarOrder::create([
                'total' => $total,
                'status' => 'pending',
                'ordered_by_user_id' => $request->user()->id,
            ]);

            foreach ($items as $item) {
                $order->items()->create([
                    'bar_product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $products[$item['product_id']]->price,
                ]);
            }
        });

        return redirect()->route('bestelling')->with('status', 'Bestelling geplaatst!');
    }

    public function pendingCount(): JsonResponse
    {
        $count = BarOrder::pending()->count();

        return response()->json(['count' => $count]);
    }
}
