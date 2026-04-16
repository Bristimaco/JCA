<?php

namespace App\Http\Controllers;

use App\Models\FoodProduct;
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
}
