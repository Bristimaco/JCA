<?php

namespace App\Http\Controllers\Admin;

use App\Exports\MembersExport;
use App\Http\Controllers\Controller;
use App\Imports\MembersImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Maatwebsite\Excel\Facades\Excel;

class MemberExcelController extends Controller
{
    public function export()
    {
        return Excel::download(new MembersExport, 'leden.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx',
        ]);
        Excel::import(new MembersImport, $request->file('file'));
        return Redirect::back()->with('status', 'Leden geïmporteerd.');
    }
}
