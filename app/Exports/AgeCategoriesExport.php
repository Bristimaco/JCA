<?php

namespace App\Exports;

use App\Models\AgeCategory;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AgeCategoriesExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return AgeCategory::all();
    }

    public function map($category): array
    {
        return [
            $category->id,
            $category->name,
            $category->country_code,
            $category->min_age,
            $category->max_age,
            $category->cutoff_date,
            $category->display_order,
            $category->is_active,
        ];
    }

    public function headings(): array
    {
        return [
            'id',
            'name',
            'country_code',
            'min_age',
            'max_age',
            'cutoff_date',
            'display_order',
            'is_active',
        ];
    }
}
