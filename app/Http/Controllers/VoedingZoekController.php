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
        $cacheKey = 'vz2_'.md5($query);

        $results = Cache::remember($cacheKey, now()->addHours(24), function () use ($query) {
            $results = $this->searchOpenFoodFacts($query);

            if (count($results) === 0) {
                $results = $this->searchUsda($query);
            }

            return $results;
        });

        return response()->json($results);
    }

    private function searchOpenFoodFacts(string $query): array
    {
        try {
            $response = Http::withUserAgent('JCA/1.0')
                ->timeout(8)
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
        } catch (\Exception $e) {
            return [];
        }
    }

    private function translateToEnglish(string $query): string
    {
        $cacheKey = 'vz2_translate_'.md5($query);

        return Cache::remember($cacheKey, now()->addHours(24), function () use ($query) {
            try {
                $response = Http::timeout(5)
                    ->get('https://api.mymemory.translated.net/get', [
                        'q' => $query,
                        'langpair' => 'nl|en',
                    ]);

                if ($response->successful()) {
                    $translated = $response->json('responseData.translatedText');

                    if ($translated && mb_strtolower($translated) !== mb_strtolower($query)) {
                        return mb_strtolower($translated);
                    }
                }
            } catch (\Exception $e) {
                // Fallback to original query
            }

            return $query;
        });
    }

    private function searchUsda(string $query): array
    {
        $apiKey = config('services.usda.api_key');

        if (! $apiKey) {
            return [];
        }

        $translatedQuery = $this->translateToEnglish($query);

        try {
            $response = Http::timeout(8)
                ->get('https://api.nal.usda.gov/fdc/v1/foods/search', [
                    'api_key' => $apiKey,
                    'query' => $translatedQuery,
                    'pageSize' => 20,
                    'dataType' => 'Survey (FNDDS),SR Legacy',
                ]);

            if ($response->failed()) {
                return [];
            }

            $foods = $response->json('foods', []);

            return collect($foods)
                ->map(function ($food) {
                    $nutrients = collect($food['foodNutrients'] ?? []);

                    $calories = $nutrients->firstWhere('nutrientId', 1008)['value'] ?? null;
                    $protein = $nutrients->firstWhere('nutrientId', 1003)['value'] ?? null;
                    $carbs = $nutrients->firstWhere('nutrientId', 1005)['value'] ?? null;
                    $fat = $nutrients->firstWhere('nutrientId', 1004)['value'] ?? null;

                    if ($calories === null && $protein === null && $carbs === null && $fat === null) {
                        return null;
                    }

                    return [
                        'name' => $food['description'] ?? '',
                        'calories' => round((float) ($calories ?? 0), 1),
                        'protein' => round((float) ($protein ?? 0), 1),
                        'carbohydrates' => round((float) ($carbs ?? 0), 1),
                        'fats' => round((float) ($fat ?? 0), 1),
                    ];
                })
                ->filter(fn ($item) => $item !== null && $item['name'] !== '')
                ->unique('name')
                ->take(10)
                ->values()
                ->all();
        } catch (\Exception $e) {
            return [];
        }
    }
}
