<?php

namespace App\Http\Controllers\Admin;

use App\Enums\InvitationStatus;
use App\Enums\TournamentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AgeCategory;
use App\Models\Member;
use App\Models\Tournament;
use Inertia\Inertia;
use Inertia\Response;

class TournamentIndexController extends Controller
{
    public function __invoke(): Response
    {
        $tournaments = Tournament::with(['ageCategories:id,name', 'attachments', 'members.weightCategory.ageCategory', 'coaches'])
            ->where('status', '!=', TournamentStatus::Archived)
            ->orderBy('tournament_date')
            ->get()
            ->map(fn(Tournament $t) => [
                ...$t->toArray(),
                'status_label' => $t->status->label(),
                'age_category_ids' => $t->ageCategories->pluck('id')->values()->all(),
                'attachments' => $t->attachments->map(fn($a) => [
                    'id' => $a->id,
                    'original_name' => $a->original_name,
                    'url' => route('attachments.show', $a),
                ]),
                'tournament_coaches' => $t->coaches->map(fn(Member $m) => [
                    'id' => $m->id,
                    'name' => $m->fullName(),
                ]),
                'tournament_members' => $t->members->map(fn(Member $m) => [
                    'id' => $m->id,
                    'name' => $m->fullName(),
                    'date_of_birth' => $m->date_of_birth->toDateString(),
                    'age_category' => $m->calculateAgeCategory($t->country_code, $t->tournament_date)?->name,
                    'weight_category' => $m->weightCategory?->name,
                    'license_number' => $m->license_number,
                    'invitation_status' => $m->pivot->invitation_status,
                    'invitation_status_label' => InvitationStatus::tryFrom($m->pivot->invitation_status)?->label() ?? $m->pivot->invitation_status,
                    'registration_status' => $m->pivot->registration_status,
                    'invited_at' => $m->pivot->invited_at,
                    'responded_at' => $m->pivot->responded_at,
                ]),
            ]);

        $ageCategories = AgeCategory::ordered()->get(['id', 'name', 'country_code', 'min_age', 'max_age']);

        // All competition members for the "add individual member" dropdown
        $competitionMembers = Member::where('is_competition', true)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn(Member $m) => [
                'id' => $m->id,
                'name' => $m->fullName(),
            ]);

        $statuses = collect(TournamentStatus::cases())->map(fn(TournamentStatus $s) => [
            'value' => $s->value,
            'label' => $s->label(),
        ])->values()->all();

        // Members linked to users with Coach role = trainers
        $availableCoaches = Member::where('is_trainer', true)
            ->whereHas('users', fn($q) => $q->where('role', UserRole::Coach->value))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn(Member $m) => [
                'id' => $m->id,
                'name' => $m->fullName(),
            ]);

        return Inertia::render('Admin/Tournaments', [
            'tournaments' => $tournaments,
            'ageCategories' => $ageCategories,
            'competitionMembers' => $competitionMembers,
            'statuses' => $statuses,
            'availableCoaches' => $availableCoaches,
        ]);
    }
}
