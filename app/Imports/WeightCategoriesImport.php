<?php

namespace App\Imports;

use App\Models\WeightCategory;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class WeightCategoriesImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        $category = isset($row['id']) ? WeightCategory::find($row['id']) : null;
        if (! $category) {
            $category = new WeightCategory;
        }
        $category->fill([
            'age_category_id' => $row['age_category_id'] ?? null,
            'name' => $row['name'] ?? null,
            'gender' => $row['gender'] ?? null,
            'max_weight_kg' => $row['max_weight_kg'] ?? null,
            'display_order' => $row['display_order'] ?? 0,
            'is_active' => $row['is_active'] ?? true,
        ]);
        $category->save();

        return $category;
    }

    public function rules(): array
    {
        return [
            'name' => 'required',
            'age_category_id' => 'required|integer',
            'gender' => 'required',
        ];
    }
}
