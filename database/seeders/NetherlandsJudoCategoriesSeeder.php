<?php

namespace Database\Seeders;

use App\Models\AgeCategory;
use App\Models\WeightCategory;
use Illuminate\Database\Seeder;

class NetherlandsJudoCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        // Remove existing NL categories (cascade deletes weight categories via FK)
        AgeCategory::where('country_code', 'NL')->delete();

        $ageCategories = [
            ['name' => '-8 jaar', 'min_age' => 6, 'max_age' => 7, 'display_order' => 1],
            ['name' => '-10 jaar', 'min_age' => 8, 'max_age' => 9, 'display_order' => 2],
            ['name' => '-12 jaar', 'min_age' => 10, 'max_age' => 11, 'display_order' => 3],
            ['name' => '-15 jaar', 'min_age' => 12, 'max_age' => 14, 'display_order' => 4],
            ['name' => '-18 jaar', 'min_age' => 14, 'max_age' => 17, 'display_order' => 5],
            ['name' => '-21 jaar', 'min_age' => 15, 'max_age' => 20, 'display_order' => 6],
            ['name' => 'Senioren', 'min_age' => 15, 'max_age' => 99, 'display_order' => 7],
        ];

        $maleWeights = [
            '-8 jaar' => [18, 21, 24, 27, 30, 34, 38],
            '-10 jaar' => [21, 24, 27, 30, 34, 38, 42],
            '-12 jaar' => [24, 27, 30, 34, 38, 42, 46, 50, -50],
            '-15 jaar' => [34, 38, 42, 46, 50, 55, 60, 66, -66],
            '-18 jaar' => [46, 50, 55, 60, 66, 73, 81, 90, -90],
            '-21 jaar' => [55, 60, 66, 73, 81, 90, 100, -100],
            'Senioren' => [60, 66, 73, 81, 90, 100, -100],
        ];

        $femaleWeights = [
            '-8 jaar' => [18, 20, 22, 25, 28, 32, 36],
            '-10 jaar' => [20, 22, 25, 28, 32, 36, 40],
            '-12 jaar' => [22, 25, 28, 32, 36, 40, 44, 48, -48],
            '-15 jaar' => [32, 36, 40, 44, 48, 52, 57, 63, -63],
            '-18 jaar' => [40, 44, 48, 52, 57, 63, 70, -70],
            '-21 jaar' => [44, 48, 52, 57, 63, 70, 78, -78],
            'Senioren' => [48, 52, 57, 63, 70, 78, -78],
        ];

        foreach ($ageCategories as $ageCategoryData) {
            $ageCategory = AgeCategory::create([
                'name' => $ageCategoryData['name'],
                'country_code' => 'NL',
                'min_age' => $ageCategoryData['min_age'],
                'max_age' => $ageCategoryData['max_age'],
                'cutoff_date' => null,
                'display_order' => $ageCategoryData['display_order'],
                'is_active' => true,
            ]);

            $this->createWeightCategories($ageCategory, $maleWeights[$ageCategoryData['name']], 'male');
            $this->createWeightCategories($ageCategory, $femaleWeights[$ageCategoryData['name']], 'female');
        }
    }

    private function createWeightCategories(AgeCategory $ageCategory, array $weights, string $gender): void
    {
        foreach ($weights as $order => $weight) {
            // Negative value = "+" (open) category
            if ($weight < 0) {
                $name = '+'.abs($weight).' kg';
                $maxWeight = 999.9;
            } else {
                $name = '-'.$weight.' kg';
                $maxWeight = $weight;
            }

            WeightCategory::create([
                'age_category_id' => $ageCategory->id,
                'name' => $name,
                'gender' => $gender,
                'max_weight_kg' => $maxWeight,
                'display_order' => $order + 1,
                'is_active' => true,
            ]);
        }
    }
}
