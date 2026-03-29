<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RecalculateAgeCategoriesController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $countryCode = $request->input('country_code', 'BE');

        $members = Member::whereNotNull('date_of_birth')->get();
        $updated = 0;

        /** @var Member $member */
        foreach ($members as $member) {
            $category = $member->calculateAgeCategory($countryCode);
            $newId = $category?->id;

            if ($member->age_category_id !== $newId) {
                $member->age_category_id = $newId;
                $member->save();
                $updated++;
            }
        }

        return back()->with('status', "Leeftijdscategorieën herberekend: {$updated} leden bijgewerkt.");
    }
}
