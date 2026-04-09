<?php

namespace App\Http\Controllers\Admin;

use App\Exports\AgeCategoriesExport;
use App\Exports\WeightCategoriesExport;
use App\Http\Controllers\Controller;
use App\Imports\AgeCategoriesImport;
use App\Imports\WeightCategoriesImport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CategoryExcelController extends Controller
{
    public function exportAgeCategories(): BinaryFileResponse
    {
        return Excel::download(new AgeCategoriesExport, 'leeftijdscategorieen.xlsx');
    }

    public function importAgeCategories(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx',
        ]);
        Excel::import(new AgeCategoriesImport, $request->file('file'));

        return Redirect::back()->with('status', 'Leeftijdscategorieën geïmporteerd.');
    }

    public function exportWeightCategories(): BinaryFileResponse
    {
        return Excel::download(new WeightCategoriesExport, 'gewichtscategorieen.xlsx');
    }

    public function importWeightCategories(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx',
        ]);
        Excel::import(new WeightCategoriesImport, $request->file('file'));

        return Redirect::back()->with('status', 'Gewichtscategorieën geïmporteerd.');
    }
}
