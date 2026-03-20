<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgeCategory;
use App\Models\Member;
use App\Models\WeightCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberIndexController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $members = Member::with('weightCategory')->orderBy('last_name')->orderBy('first_name')->get()
            ->map(fn (Member $m) => [
                ...$m->toArray(),
                'photo_url' => $m->photo_path ? asset('storage/'.$m->photo_path) : null,
                'weight_category_name' => $m->weightCategory?->name,
            ]);

        $ageCategories = AgeCategory::ordered()->get();
        $weightCategories = WeightCategory::ordered()->get();

        return Inertia::render('Admin/Members', [
            'members' => $members,
            'ageCategories' => $ageCategories,
            'weightCategories' => $weightCategories,
        ]);
    }
}
