<?php

namespace App\Http\Controllers;

use App\Models\BarProduct;
use Inertia\Inertia;
use Inertia\Response;

class POSController extends Controller
{
    public function __invoke(): Response
    {
        $products = BarProduct::active()
            ->ordered()
            ->get(['id', 'name', 'price']);

        return Inertia::render('POS', [
            'products' => $products,
        ]);
    }
}
