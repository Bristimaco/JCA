<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgeCategory;
use Inertia\Inertia;
use Inertia\Response;

class AgeCategoryPageController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/AgeCategories', [
            'ageCategories' => AgeCategory::ordered()->get(),
        ]);
    }
}
