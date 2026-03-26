<?php

namespace App\Http\Controllers;

use App\Enums\TournamentStatus;
use App\Models\Tournament;
use App\Models\TournamentResult;
use Inertia\Inertia;
use Inertia\Response;

class ArchivedTournamentsController extends Controller
{
    public function __invoke(): Response
    {
        $tournaments = Tournament::where('status', TournamentStatus::Archived)
            ->with(['ageCategories:id,name', 'attachments', 'coaches'])
            ->orderByDesc('tournament_date')
            ->get()
            ->map(function (Tournament $t) {
                $results = TournamentResult::where('tournament_id', $t->id)
                    ->with('member')
                    ->get();

                return [
                    'id' => $t->id,
                    'name' => $t->name,
                    'tournament_date' => $t->tournament_date->toDateString(),
                    'address_street' => $t->address_street,
                    'address_city' => $t->address_city,
                    'country_code' => $t->country_code,
                    'latitude' => $t->latitude,
                    'longitude' => $t->longitude,
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'coaches' => $t->coaches->map(fn($m) => $m->fullName())->values()->all(),
                    'attachments' => $t->attachments->map(fn($a) => [
                        'id' => $a->id,
                        'original_name' => $a->original_name,
                        'url' => route('attachments.show', $a),
                    ])->values()->all(),
                    'results' => $results->map(fn($r) => [
                        'member_name' => $r->member->fullName(),
                        'result' => $r->result,
                        'notes' => $r->notes,
                    ])->values()->all(),
                ];
            });

        return Inertia::render('ArchivedTournaments', [
            'tournaments' => $tournaments,
        ]);
    }
}
