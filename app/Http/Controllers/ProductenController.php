<?php

namespace App\Http\Controllers;

use App\Models\FoodProduct;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductenController extends Controller
{
    public function index(): Response
    {
        $products = FoodProduct::ordered()
            ->get(['id', 'name', 'calories', 'protein', 'carbohydrates', 'fats']);

        return Inertia::render('Producten', [
            'products' => $products,
        ]);
    }

    public function destroy(FoodProduct $foodProduct): RedirectResponse
    {
        $name = $foodProduct->name;
        $foodProduct->delete();

        return back()->with('status', "Product '{$name}' verwijderd.");
    }
}
