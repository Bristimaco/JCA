<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BeltRank;
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
        $members = Member::with(['weightCategory', 'tournamentResults.tournament'])->orderBy('last_name')->orderBy('first_name')->get()
            ->map(fn(Member $m) => [
                ...$m->toArray(),
                'photo_url' => $m->photo_data ? route('member-photo', $m) : null,
                'weight_category_name' => $m->weightCategory?->name,
                'current_belt' => $m->currentBelt()?->value,
                'current_belt_label' => $m->currentBelt()?->label(),
                'tournament_results' => $m->is_competition ? $m->tournamentResults->sortByDesc(fn($r) => $r->tournament->tournament_date)->map(fn($r) => [
                    'id' => $r->id,
                    'tournament_name' => $r->tournament->name,
                    'tournament_date' => $r->tournament->tournament_date->toDateString(),
                    'result' => $r->result,
                    'notes' => $r->notes,
                ])->values()->all() : [],
            ]);

        $ageCategories = AgeCategory::ordered()->get();
        $weightCategories = WeightCategory::ordered()->get();

        $beltRanks = collect(BeltRank::cases())->map(fn(BeltRank $b) => [
            'value' => $b->value,
            'label' => $b->label(),
        ])->values()->all();

        return Inertia::render('Admin/Members', [
            'members' => $members,
            'ageCategories' => $ageCategories,
            'weightCategories' => $weightCategories,
            'beltRanks' => $beltRanks,
        ]);
    }
}
