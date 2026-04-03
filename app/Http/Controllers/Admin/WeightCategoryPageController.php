<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgeCategory;
use App\Models\WeightCategory;
use Inertia\Inertia;
use Inertia\Response;

class WeightCategoryPageController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/WeightCategories', [
            'ageCategories' => AgeCategory::ordered()->get(),
            'weightCategories' => WeightCategory::ordered()->get(),
        ]);
    }
}
