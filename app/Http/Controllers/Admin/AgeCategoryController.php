<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgeCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AgeCategoryController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'country_code' => ['required', 'string', 'size:2'],
            'min_age' => ['required', 'integer', 'min:0', 'max:99'],
            'max_age' => ['required', 'integer', 'min:0', 'max:99', 'gte:min_age'],
            'cutoff_date' => ['nullable', 'string', 'regex:/^\d{2}-\d{2}$/'],
            'display_order' => ['required', 'integer', 'min:0'],
        ]);

        AgeCategory::create($validated);

        return back()->with('status', "Leeftijdscategorie {$validated['name']} is aangemaakt.");
    }

    public function update(Request $request, AgeCategory $ageCategory): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'min_age' => ['required', 'integer', 'min:0', 'max:99'],
            'max_age' => ['required', 'integer', 'min:0', 'max:99', 'gte:min_age'],
            'cutoff_date' => ['nullable', 'string', 'regex:/^\d{2}-\d{2}$/'],
            'display_order' => ['required', 'integer', 'min:0'],
        ]);

        $ageCategory->update($validated);

        return back()->with('status', "{$ageCategory->name} is bijgewerkt.");
    }

    public function destroy(AgeCategory $ageCategory): RedirectResponse
    {
        $name = $ageCategory->name;
        $ageCategory->delete();

        return back()->with('status', "Leeftijdscategorie {$name} is verwijderd.");
    }
}
