<?php

namespace App\Exports;

use App\Models\AgeCategory;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AgeCategoriesExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return AgeCategory::all([
            'id',
            'name',
            'country_code',
            'min_age',
            'max_age',
            'cutoff_date',
            'display_order',
            'is_active',
        ]);
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
