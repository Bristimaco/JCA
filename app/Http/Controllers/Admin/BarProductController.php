<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BarProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BarProductController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ]);

        BarProduct::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'display_order' => $validated['display_order'] ?? 0,
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
}
