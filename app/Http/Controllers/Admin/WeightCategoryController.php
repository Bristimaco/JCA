<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WeightCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WeightCategoryController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'age_category_id' => ['required', 'exists:age_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:male,female'],
            'min_weight_kg' => ['required', 'numeric', 'min:0', 'max:999.9'],
            'max_weight_kg' => ['required', 'numeric', 'min:0', 'max:999.9', 'gte:min_weight_kg'],
            'display_order' => ['required', 'integer', 'min:0'],
        ]);

        WeightCategory::create($validated);

        return back()->with('status', "Gewichtscategorie {$validated['name']} is aangemaakt.");
    }

    public function update(Request $request, WeightCategory $weightCategory): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'gender' => ['required', 'string', 'in:male,female'],
            'min_weight_kg' => ['required', 'numeric', 'min:0', 'max:999.9'],
            'max_weight_kg' => ['required', 'numeric', 'min:0', 'max:999.9', 'gte:min_weight_kg'],
            'display_order' => ['required', 'integer', 'min:0'],
        ]);

        $weightCategory->update($validated);

        return back()->with('status', "Gewichtscategorie {$weightCategory->name} is bijgewerkt.");
    }

    public function destroy(WeightCategory $weightCategory): RedirectResponse
    {
        $name = $weightCategory->name;
        $weightCategory->delete();

        return back()->with('status', "Gewichtscategorie {$name} is verwijderd.");
    }
}
