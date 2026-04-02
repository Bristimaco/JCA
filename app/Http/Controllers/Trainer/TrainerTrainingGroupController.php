<?php

namespace App\Http\Controllers\Trainer;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\TrainingGroup;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrainerTrainingGroupController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();

        $query = $isAdmin
            ? TrainingGroup::query()
            : TrainingGroup::whereHas('schedules', fn ($q) => $q->where('trainer_id', $user->id));

        $groups = $query
            ->with(['members:id,first_name,last_name', 'schedules.trainer:id,name'])
            ->orderBy('name')
            ->get()
            ->map(fn (TrainingGroup $g) => [
                'id' => $g->id,
                'name' => $g->name,
                'description' => $g->description,
                'membership_fee' => $g->membership_fee,
                'membership_fee_discount' => $g->membership_fee_discount,
                'location' => $g->location,
                'allow_external_members' => $g->allow_external_members,
                'schedules' => $g->schedules->map(fn ($s) => [
                    'day' => $s->day,
                    'start_time' => $s->start_time,
                    'end_time' => $s->end_time,
                    'trainer_id' => $s->trainer_id,
                    'trainer_name' => $s->trainer?->name,
                ])->values()->all(),
                'member_ids' => $g->members->pluck('id')->values()->all(),
                'members' => $g->members->map(fn ($m) => [
                    'id' => $m->id,
                    'name' => $m->fullName(),
                ])->sortBy('name')->values()->all(),
                'member_count' => $g->members->count(),
            ]);

        $allMembers = Member::orderBy('last_name')->orderBy('first_name')->get()
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->fullName(),
            ]);

        $props = [
            'groups' => $groups,
            'allMembers' => $allMembers,
            'isAdmin' => $isAdmin,
        ];

        if ($isAdmin) {
            $props['trainers'] = User::where('role', UserRole::Coach)
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                ]);
        }

        return Inertia::render('Trainer/TrainingGroups', $props);
    }
}
