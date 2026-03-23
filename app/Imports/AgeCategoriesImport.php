<?php

namespace App\Imports;

use App\Models\AgeCategory;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class AgeCategoriesImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        $category = isset($row['id']) ? AgeCategory::find($row['id']) : null;
        if (! $category) {
            $category = new AgeCategory;
        }
        $category->fill([
            'name' => $row['name'] ?? null,
            'country_code' => $row['country_code'] ?? null,
            'min_age' => $row['min_age'] ?? null,
            'max_age' => $row['max_age'] ?? null,
            'cutoff_date' => $row['cutoff_date'] ?? null,
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
            'country_code' => 'required|size:2',
            'min_age' => 'required|integer',
            'max_age' => 'required|integer',
        ];
    }
}
