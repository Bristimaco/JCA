<?php

namespace App\Http\Controllers\Admin;

use App\Enums\InvitationStatus;
use App\Enums\StageStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AgeCategory;
use App\Models\Member;
use App\Models\Stage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StageIndexController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();

        $query = Stage::with(['ageCategories', 'attachments', 'members.weightCategory.ageCategory', 'coaches'])
            ->where('status', '!=', StageStatus::Archived)
            ->orderBy('start_date');

        if (! $isAdmin) {
            $coachMemberIds = $user->members()->pluck('members.id');
            $query->whereHas('coaches', fn ($q) => $q->whereIn('members.id', $coachMemberIds));
        }

        $stages = $query->get()
            ->map(fn (Stage $s) => [
                ...$s->toArray(),
                'status_label' => $s->status->label(),
                'age_category_ids' => $s->ageCategories->pluck('id')->values()->all(),
                'age_category_fees' => $s->ageCategories->mapWithKeys(fn ($cat) => [$cat->id => $cat->pivot->entry_fee])->all(),
                'attachments' => $s->attachments->map(fn ($a) => [
                    'id' => $a->id,
                    'original_name' => $a->original_name,
                    'url' => route('stage-attachments.show', $a),
                ]),
                'stage_coaches' => $s->coaches->map(fn (Member $m) => [
                    'id' => $m->id,
                    'name' => $m->fullName(),
                ]),
                'stage_members' => $s->members->map(fn (Member $m) => [
                    'id' => $m->id,
                    'name' => $m->fullName(),
                    'date_of_birth' => $m->date_of_birth->toDateString(),
                    'age_category' => $m->calculateAgeCategory($s->country_code, $s->start_date)?->name,
                    'weight_category' => $m->weightCategory?->name,
                    'license_number' => $m->license_number,
                    'invitation_status' => $m->pivot->invitation_status,
                    'invitation_status_label' => InvitationStatus::tryFrom($m->pivot->invitation_status)?->label() ?? $m->pivot->invitation_status,
                    'registration_status' => $m->pivot->registration_status,
                    'payment_status' => $m->pivot->payment_status,
                    'mollie_payment_url' => $m->pivot->mollie_payment_url,
                    'invited_at' => $m->pivot->invited_at,
                    'responded_at' => $m->pivot->responded_at,
                ]),
            ]);

        $ageCategories = AgeCategory::ordered()->get(['id', 'name', 'country_code', 'min_age', 'max_age']);

        $competitionMembers = Member::where('is_competition', true)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->fullName(),
            ]);

        $statuses = collect(StageStatus::cases())->map(fn (StageStatus $s) => [
            'value' => $s->value,
            'label' => $s->label(),
        ])->values()->all();

        $availableCoaches = Member::where('is_trainer', true)
            ->whereHas('users', fn ($q) => $q->where('role', UserRole::Coach->value))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->fullName(),
            ]);

        return Inertia::render('Admin/Stages', [
            'stages' => $stages,
            'ageCategories' => $ageCategories,
            'competitionMembers' => $competitionMembers,
            'statuses' => $statuses,
            'availableCoaches' => $availableCoaches,
            'userRole' => $user->role->value,
        ]);
    }
}
