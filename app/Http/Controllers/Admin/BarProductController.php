<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BarCategory;
use App\Models\BarOrder;
use App\Models\BarOrderItem;
use App\Models\BarProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class BarProductController extends Controller
{
    public function index(): Response
    {
        $products = BarProduct::ordered()->get(['id', 'name', 'price', 'is_active', 'display_order', 'bar_category_id']);
        $categories = BarCategory::ordered()->get(['id', 'name', 'display_order']);

        return Inertia::render('Admin/BarProducts', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function refillIndex(): Response
    {
        $refillProducts = BarProduct::needsRefill()
            ->ordered()
            ->get(['id', 'name', 'price', 'needs_refill_at']);

        return Inertia::render('Admin/RefillProducts', [
            'refillProducts' => $refillProducts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'bar_category_id' => ['required', 'exists:bar_categories,id'],
        ]);

        BarProduct::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'display_order' => $validated['display_order'] ?? 0,
            'bar_category_id' => $validated['bar_category_id'],
        ]);

        return back()->with('status', "Product '{$validated['name']}' aangemaakt.");
    }

    public function update(Request $request, BarProduct $barProduct): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['required', 'boolean'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'bar_category_id' => ['required', 'exists:bar_categories,id'],
        ]);

        $barProduct->update($validated);

        return back()->with('status', "Product '{$barProduct->name}' bijgewerkt.");
    }

    public function destroy(BarProduct $barProduct): RedirectResponse
    {
        $name = $barProduct->name;
        $barProduct->delete();

        return back()->with('status', "Product '{$name}' verwijderd.");
    }

    public function clearRefill(BarProduct $barProduct): RedirectResponse
    {
        $barProduct->update([
            'needs_refill' => false,
            'needs_refill_at' => null,
        ]);

        return back()->with('status', "Product '{$barProduct->name}' is aangevuld.");
    }

    public function salesStats(Request $request): Response
    {
        $period = $request->query('period', 'month');

        $from = match ($period) {
            'half_year' => Carbon::now()->subMonths(6)->startOfDay(),
            'year' => Carbon::now()->subYear()->startOfDay(),
            'all' => null,
            default => Carbon::now()->subMonth()->startOfDay(),
        };

        $query = BarOrderItem::query()
            ->selectRaw('bar_product_id, SUM(quantity) as total_quantity, SUM(quantity * unit_price) as total_revenue')
            ->groupBy('bar_product_id');

        if ($from) {
            $query->where('created_at', '>=', $from);
        }

        $stats = $query->orderByDesc('total_quantity')->get();

        $productIds = $stats->pluck('bar_product_id');
        $products = BarProduct::whereIn('id', $productIds)->get()->keyBy('id');

        $rankings = $stats->map(fn ($s) => [
            'product_name' => $products[$s->bar_product_id]?->name ?? 'Verwijderd product',
            'total_quantity' => (int) $s->total_quantity,
            'total_revenue' => number_format($s->total_revenue, 2, '.', ''),
        ])->values()->all();

        $totalOrders = BarOrder::query()
            ->when($from, fn ($q) => $q->where('created_at', '>=', $from))
            ->count();

        $totalRevenue = BarOrder::query()
            ->when($from, fn ($q) => $q->where('created_at', '>=', $from))
            ->sum('total');

        return Inertia::render('Admin/SalesStats', [
            'rankings' => $rankings,
            'period' => $period,
            'totalOrders' => $totalOrders,
            'totalRevenue' => number_format($totalRevenue, 2, '.', ''),
        ]);
    }
}
