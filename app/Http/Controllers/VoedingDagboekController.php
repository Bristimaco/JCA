<?php

namespace App\Http\Controllers;

use App\Models\FoodDiaryEntry;
use App\Models\FoodProduct;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoedingDagboekController extends Controller
{
    public function show(Request $request, Member $member): Response
    {
        $this->authorizeMember($request, $member);

        $entries = $member->foodDiaryEntries()
            ->forToday()
            ->with('foodProduct:id,name,calories,protein,carbohydrates,fats')
            ->get()
            ->map(fn (FoodDiaryEntry $e) => [
                'id' => $e->id,
                'food_product_id' => $e->food_product_id,
                'name' => $e->foodProduct->name,
                'category' => $e->category,
                'grams' => $e->grams,
                'calories' => round((float) $e->grams / 100 * (float) $e->foodProduct->calories, 1),
                'protein' => round((float) $e->grams / 100 * (float) $e->foodProduct->protein, 1),
                'carbohydrates' => round((float) $e->grams / 100 * (float) $e->foodProduct->carbohydrates, 1),
                'fats' => round((float) $e->grams / 100 * (float) $e->foodProduct->fats, 1),
            ]);

        $myProducts = $request->user()->foodProducts()
            ->orderBy('name')
            ->get(['food_products.id', 'name', 'calories', 'protein', 'carbohydrates', 'fats']);

        $catalog = FoodProduct::orderBy('name')
            ->get(['id', 'name', 'calories', 'protein', 'carbohydrates', 'fats']);

        return Inertia::render('VoedingDagboek', [
            'member' => [
                'id' => $member->id,
                'name' => $member->fullName(),
                'nutrition_plan' => $member->nutritionPlan,
            ],
            'entries' => $entries,
            'myProducts' => $myProducts,
            'catalog' => $catalog,
        ]);
    }

    public function store(Request $request, Member $member): RedirectResponse
    {
        $this->authorizeMember($request, $member);

        $validated = $request->validate([
            'food_product_id' => ['required', 'exists:food_products,id'],
            'category' => ['required', 'in:ontbijt,middagmaal,avondmaal,tussendoortjes'],
            'grams' => ['required', 'numeric', 'min:1', 'max:9999'],
        ]);

        $member->foodDiaryEntries()->create([
            ...$validated,
            'date' => now()->toDateString(),
        ]);

        $product = FoodProduct::find($validated['food_product_id']);

        return back()->with('status', "{$product->name} ({$validated['grams']}g) toegevoegd.");
    }

    public function destroy(Request $request, FoodDiaryEntry $foodDiaryEntry): RedirectResponse
    {
        $this->authorizeMember($request, $foodDiaryEntry->member);

        $name = $foodDiaryEntry->foodProduct->name;
        $foodDiaryEntry->delete();

        return back()->with('status', "{$name} verwijderd.");
    }

    public function addProduct(Request $request, Member $member): RedirectResponse
    {
        $this->authorizeMember($request, $member);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $request->validate([
            'default_portion' => ['nullable', 'numeric', 'min:1', 'max:9999'],
        ]);

        $portion = $request->input('default_portion', 100);
        $existing = FoodProduct::where('name', $request->input('name'))->first();

        if ($existing) {
            $request->user()->foodProducts()->syncWithoutDetaching([$existing->id => ['default_portion' => $portion]]);

            return back()->with('status', "'{$existing->name}' toegevoegd aan je productenlijst.")
                ->with('added_product_id', $existing->id);
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

        return back()->with('status', "'{$product->name}' aangemaakt en toegevoegd aan je productenlijst.")
            ->with('added_product_id', $product->id);
    }

    private function authorizeMember(Request $request, Member $member): void
    {
        if (! $request->user()->members()->where('members.id', $member->id)->exists()) {
            abort(403);
        }
    }
}
