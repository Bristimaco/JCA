<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BarCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BarCategoryController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:bar_categories,name'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ]);

        BarCategory::create([
            'name' => $validated['name'],
            'display_order' => $validated['display_order'] ?? 0,
        ]);

        return back()->with('status', "Rubriek '{$validated['name']}' aangemaakt.");
    }

    public function update(Request $request, BarCategory $barCategory): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:bar_categories,name,'.$barCategory->id],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $barCategory->update($validated);

        return back()->with('status', "Rubriek '{$barCategory->name}' bijgewerkt.");
    }

    public function destroy(BarCategory $barCategory): RedirectResponse
    {
        $count = $barCategory->products()->count();
        $name = $barCategory->name;

        if ($count > 0) {
            return back()->with('status', "Rubriek '{$name}' bevat nog {$count} product(en). Verwijder of verplaats deze eerst.");
        }

        $barCategory->delete();

        return back()->with('status', "Rubriek '{$name}' verwijderd.");
    }
}
