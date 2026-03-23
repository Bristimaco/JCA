<?php

namespace App\Http\Controllers\Admin;

use App\Exports\AgeCategoriesExport;
use App\Exports\WeightCategoriesExport;
use App\Http\Controllers\Controller;
use App\Imports\AgeCategoriesImport;
use App\Imports\WeightCategoriesImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Maatwebsite\Excel\Facades\Excel;

class CategoryExcelController extends Controller
{
    public function exportAgeCategories()
    {
        return Excel::download(new AgeCategoriesExport, 'leeftijdscategorieen.xlsx');
    }

    public function importAgeCategories(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx',
        ]);
        Excel::import(new AgeCategoriesImport, $request->file('file'));

        return Redirect::back()->with('status', 'Leeftijdscategorieën geïmporteerd.');
    }

    public function exportWeightCategories()
    {
        return Excel::download(new WeightCategoriesExport, 'gewichtscategorieen.xlsx');
    }

    public function importWeightCategories(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx',
        ]);
        Excel::import(new WeightCategoriesImport, $request->file('file'));

        return Redirect::back()->with('status', 'Gewichtscategorieën geïmporteerd.');
    }
}
