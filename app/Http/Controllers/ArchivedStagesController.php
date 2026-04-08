<?php

namespace App\Http\Controllers;

use App\Enums\StageStatus;
use App\Models\Stage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ArchivedStagesController extends Controller
{
    public function __invoke(): Response
    {
        $stages = Stage::where('status', StageStatus::Archived)
            ->with(['ageCategories:id,name', 'attachments', 'coaches'])
            ->orderByDesc('start_date')
            ->get()
            ->map(fn (Stage $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'start_date' => $s->start_date->toDateString(),
                'end_date' => $s->end_date->toDateString(),
                'address_street' => $s->address_street,
                'address_city' => $s->address_city,
                'country_code' => $s->country_code,
                'latitude' => $s->latitude,
                'longitude' => $s->longitude,
                'coaches' => $s->coaches->map(fn ($m) => $m->fullName())->filter()->values()->all(),
                'attachments' => $s->attachments->map(fn ($a) => [
                    'id' => $a->id,
                    'original_name' => $a->original_name,
                    'url' => route('stage-attachments.show', $a),
                ])->values()->all(),
            ]);

        return Inertia::render('ArchivedStages', [
            'stages' => $stages,
        ]);
    }

    public function destroy(Stage $stage): RedirectResponse
    {
        abort_unless($stage->status === StageStatus::Archived, 403);

        $stage->delete();

        return redirect()->route('archived.stages')->with('status', 'Stage is verwijderd.');
    }
}
