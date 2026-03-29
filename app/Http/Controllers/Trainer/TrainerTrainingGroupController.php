<?php

namespace App\Http\Controllers\Trainer;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\TrainingGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrainerTrainingGroupController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $groups = TrainingGroup::whereHas('schedules', fn($q) => $q->where('trainer_id', $userId))
            ->with(['members:id,first_name,last_name', 'schedules.trainer:id,name'])
            ->orderBy('name')
            ->get()
            ->map(fn(TrainingGroup $g) => [
                'id' => $g->id,
                'name' => $g->name,
                'description' => $g->description,
                'membership_fee' => $g->membership_fee,
                'location' => $g->location,
                'schedules' => $g->schedules->map(fn($s) => [
                    'day' => $s->day,
                    'start_time' => $s->start_time,
                    'end_time' => $s->end_time,
                    'trainer_name' => $s->trainer?->name,
                ])->values()->all(),
                'member_ids' => $g->members->pluck('id')->values()->all(),
                'members' => $g->members->map(fn($m) => [
                    'id' => $m->id,
                    'name' => $m->fullName(),
                ])->sortBy('name')->values()->all(),
                'member_count' => $g->members->count(),
            ]);

        $allMembers = Member::orderBy('last_name')->orderBy('first_name')->get()
            ->map(fn(Member $m) => [
                'id' => $m->id,
                'name' => $m->fullName(),
            ]);

        return Inertia::render('Trainer/TrainingGroups', [
            'groups' => $groups,
            'allMembers' => $allMembers,
        ]);
    }
}
