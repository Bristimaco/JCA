<?php

namespace App\Exports;

use App\Models\WeightCategory;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class WeightCategoriesExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return WeightCategory::all([
            'id',
            'age_category_id',
            'name',
            'gender',
            'max_weight_kg',
            'display_order',
            'is_active',
        ]);
    }

    public function headings(): array
    {
        return [
            'id',
            'age_category_id',
            'name',
            'gender',
            'max_weight_kg',
            'display_order',
            'is_active',
        ];
    }
}
