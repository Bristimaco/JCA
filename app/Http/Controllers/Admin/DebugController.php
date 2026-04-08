<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BarOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DebugController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Debug', [
            'barOrderCount' => BarOrder::count(),
        ]);
    }

    public function barOrders(Request $request): Response
    {
        $query = BarOrder::with(['items.product', 'user', 'orderedBy'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return Inertia::render('Admin/DebugBarOrders', [
            'orders' => $query->paginate(50)->withQueryString(),
            'status' => $request->input('status', ''),
        ]);
    }

    public function destroyBarOrder(BarOrder $barOrder): RedirectResponse
    {
        $barOrder->delete();

        return back()->with('status', 'Bestelling verwijderd.');
    }
}
