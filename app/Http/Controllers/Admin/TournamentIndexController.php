<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TournamentStatus;
use App\Http\Controllers\Controller;
use App\Models\AgeCategory;
use App\Models\Tournament;
use Inertia\Inertia;
use Inertia\Response;

class TournamentIndexController extends Controller
{
    public function __invoke(): Response
    {
        $tournaments = Tournament::with(['ageCategories:id,name', 'attachments'])
            ->orderByDesc('tournament_date')
            ->get()
            ->map(fn(Tournament $t) => [
                ...$t->toArray(),
                'status_label' => $t->status->label(),
                'age_category_ids' => $t->ageCategories->pluck('id')->values()->all(),
                'attachments' => $t->attachments->map(fn($a) => [
                    'id' => $a->id,
                    'original_name' => $a->original_name,
                    'url' => asset('storage/' . $a->file_path),
                ]),
            ]);

        $ageCategories = AgeCategory::ordered()->get(['id', 'name', 'country_code', 'min_age', 'max_age']);

        $statuses = collect(TournamentStatus::cases())->map(fn(TournamentStatus $s) => [
            'value' => $s->value,
            'label' => $s->label(),
        ])->values()->all();

        return Inertia::render('Admin/Tournaments', [
            'tournaments' => $tournaments,
            'ageCategories' => $ageCategories,
            'statuses' => $statuses,
        ]);
    }
}
