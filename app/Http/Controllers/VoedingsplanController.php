<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoedingsplanController extends Controller
{
    public function index(Request $request): Response
    {
        $members = $request->user()
            ->members()
            ->orderBy('first_name')
            ->get(['members.id', 'first_name', 'last_name'])
            ->map(function (Member $member) {
                return [
                    'id' => $member->id,
                    'name' => $member->fullName(),
                    'nutrition_plan' => $member->nutritionPlan,
                ];
            });

        return Inertia::render('Voedingsplan', [
            'members' => $members,
        ]);
    }

    public function store(Request $request, Member $member): RedirectResponse
    {
        $isMine = $request->user()->members()->where('members.id', $member->id)->exists();

        if (! $isMine) {
            abort(403);
        }

        $validated = $request->validate([
            'min_calories' => ['required', 'numeric', 'min:0', 'max:99999'],
            'max_calories' => ['required', 'numeric', 'min:0', 'max:99999'],
            'min_protein' => ['required', 'numeric', 'min:0', 'max:99999'],
            'max_protein' => ['required', 'numeric', 'min:0', 'max:99999'],
            'min_carbohydrates' => ['required', 'numeric', 'min:0', 'max:99999'],
            'max_carbohydrates' => ['required', 'numeric', 'min:0', 'max:99999'],
            'min_fats' => ['required', 'numeric', 'min:0', 'max:99999'],
            'max_fats' => ['required', 'numeric', 'min:0', 'max:99999'],
        ]);

        $member->nutritionPlan()->updateOrCreate(
            ['member_id' => $member->id],
            $validated,
        );

        return back()->with('status', "Voedingsplan voor {$member->fullName()} opgeslagen.");
    }
}
