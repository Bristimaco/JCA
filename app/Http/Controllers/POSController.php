<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\BarCategory;
use App\Models\BarOrder;
use App\Models\BarProduct;
use App\Models\User;
use App\Notifications\BarProductRefillNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
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
            ->get(['id', 'name', 'price', 'needs_refill', 'bar_category_id']);

        $categories = BarCategory::ordered()->get(['id', 'name']);

        $pendingOrderCount = BarOrder::where('status', 'pending')->count();

        return Inertia::render('POS', [
            'products' => $products,
            'categories' => $categories,
            'pendingOrderCount' => $pendingOrderCount,
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
                'status' => 'ready',
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

    public function orders(): Response
    {
        $orders = BarOrder::whereIn('status', ['pending', 'preparing', 'ready'])
            ->with(['items.product:id,name', 'orderedBy:id,name'])
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('POS/Bestellingen', [
            'orders' => $orders,
        ]);
    }

    public function startPreparing(BarOrder $barOrder): RedirectResponse
    {
        if ($barOrder->status !== 'pending') {
            return back()->with('error', 'Bestelling kan niet worden klaargezet.');
        }

        $barOrder->update([
            'status' => 'preparing',
            'user_id' => auth()->id(),
        ]);

        return back();
    }

    public function markReady(BarOrder $barOrder): RedirectResponse
    {
        if ($barOrder->status !== 'preparing') {
            return back()->with('error', 'Bestelling kan niet als klaar worden gemarkeerd.');
        }

        $barOrder->update(['status' => 'ready']);

        return back();
    }

    public function markPaid(BarOrder $barOrder, Request $request): RedirectResponse
    {
        if (! in_array($barOrder->status, ['ready', 'poef'])) {
            return back()->with('error', 'Bestelling kan niet als betaald worden gemarkeerd.');
        }

        $barOrder->update([
            'status' => 'paid',
            'payment_method' => $request->input('payment_method', 'other'),
            'payment_status' => 'paid',
            'paid_at' => now(),
            'user_id' => $barOrder->user_id ?? auth()->id(),
        ]);

        return back();
    }

    public function markPoef(BarOrder $barOrder, Request $request): RedirectResponse
    {
        if ($barOrder->status !== 'ready') {
            return back()->with('error', 'Bestelling kan niet op de poef worden gezet.');
        }

        $request->validate([
            'ordered_by_user_id' => ['nullable', 'exists:users,id'],
        ]);

        $data = ['status' => 'poef'];

        if ($request->filled('ordered_by_user_id')) {
            $data['ordered_by_user_id'] = $request->input('ordered_by_user_id');
        }

        if (! $barOrder->ordered_by_user_id && ! $request->filled('ordered_by_user_id')) {
            return back()->with('error', 'Selecteer een gebruiker voor de poef.');
        }

        $barOrder->update($data);

        return back();
    }

    public function searchUsers(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        $users = User::where('is_active', true)
            ->where('name', 'ilike', '%'.$query.'%')
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'name']);

        return response()->json($users);
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
