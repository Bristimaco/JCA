<?php

namespace App\Http\Controllers;

use App\Models\FoodProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MijnProductenController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $myProducts = $user->foodProducts()
            ->orderBy('name')
            ->get(['food_products.id', 'name', 'calories', 'protein', 'carbohydrates', 'fats']);

        $catalog = FoodProduct::ordered()
            ->get(['id', 'name', 'calories', 'protein', 'carbohydrates', 'fats']);

        return Inertia::render('MijnProducten', [
            'myProducts' => $myProducts,
            'catalog' => $catalog,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'default_portion' => ['nullable', 'numeric', 'min:1', 'max:9999'],
        ]);

        $portion = $request->input('default_portion', 100);
        $existing = FoodProduct::where('name', $request->input('name'))->first();

        if ($existing) {
            $request->user()->foodProducts()->syncWithoutDetaching([$existing->id => ['default_portion' => $portion]]);

            return back()->with('status', "'{$existing->name}' toegevoegd aan je lijst.");
        }

        $request->validate([
            'calories' => ['required', 'numeric', 'min:0', 'max:99999'],
            'protein' => ['required', 'numeric', 'min:0', 'max:99999'],
            'carbohydrates' => ['required', 'numeric', 'min:0', 'max:99999'],
            'fats' => ['required', 'numeric', 'min:0', 'max:99999'],
        ]);

        $product = FoodProduct::create([
            'name' => $request->input('name'),
            'calories' => $request->input('calories'),
            'protein' => $request->input('protein'),
            'carbohydrates' => $request->input('carbohydrates'),
            'fats' => $request->input('fats'),
            'created_by' => $request->user()->id,
        ]);

        $request->user()->foodProducts()->attach($product, ['default_portion' => $portion]);

        return back()->with('status', "'{$product->name}' aangemaakt en toegevoegd aan je lijst.");
    }

    public function updatePortion(Request $request, FoodProduct $foodProduct): RedirectResponse
    {
        $request->validate([
            'default_portion' => ['required', 'numeric', 'min:1', 'max:9999'],
        ]);

        $request->user()->foodProducts()->updateExistingPivot($foodProduct->id, [
            'default_portion' => $request->input('default_portion'),
        ]);

        return back()->with('status', "Standaard portie van '{$foodProduct->name}' bijgewerkt.");
    }

    public function destroy(Request $request, FoodProduct $foodProduct): RedirectResponse
    {
        $request->user()->foodProducts()->detach($foodProduct->id);

        return back()->with('status', "'{$foodProduct->name}' verwijderd uit je lijst.");
    }
}
