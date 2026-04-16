<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class VoedingZoekController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $query = mb_strtolower(trim($request->input('q')));
        $cacheKey = 'voeding_zoek_'.md5($query);

        $results = Cache::remember($cacheKey, now()->addHours(24), function () use ($query) {
            $response = Http::withUserAgent('JCA/1.0')
                ->timeout(5)
                ->get('https://world.openfoodfacts.org/cgi/search.pl', [
                    'search_terms' => $query,
                    'search_simple' => 1,
                    'action' => 'process',
                    'json' => 1,
                    'page_size' => 20,
                    'fields' => 'product_name,nutriments',
                ]);

            if ($response->failed()) {
                return [];
            }

            $products = $response->json('products', []);

            return collect($products)
                ->filter(function ($product) {
                    $name = $product['product_name'] ?? '';
                    $n = $product['nutriments'] ?? [];

                    return $name !== ''
                        && isset($n['energy-kcal_100g'])
                        && isset($n['proteins_100g'])
                        && isset($n['carbohydrates_100g'])
                        && isset($n['fat_100g']);
                })
                ->map(function ($product) {
                    $n = $product['nutriments'];

                    return [
                        'name' => $product['product_name'],
                        'calories' => round((float) $n['energy-kcal_100g'], 1),
                        'protein' => round((float) $n['proteins_100g'], 1),
                        'carbohydrates' => round((float) $n['carbohydrates_100g'], 1),
                        'fats' => round((float) $n['fat_100g'], 1),
                    ];
                })
                ->unique('name')
                ->take(10)
                ->values()
                ->all();
        });

        return response()->json($results);
    }
}
