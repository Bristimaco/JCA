<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AgeCategory;
use App\Models\ClubSettings;
use App\Models\Member;
use App\Models\MembershipInvoice;
use App\Models\TrainingGroup;
use App\Models\User;
use App\Models\WeightCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $pendingUsers = User::whereNull('role')
            ->whereNotNull('email_verified_at')
            ->orderBy('created_at')
            ->get(['id', 'name', 'email', 'created_at']);

        $users = User::whereNotNull('role')
            ->with('members:id')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'results_interest'])
            ->map(fn (User $u) => [
                ...$u->toArray(),
                'member_ids' => $u->members->pluck('id')->values()->all(),
            ]);

        $allMembers = Member::orderBy('last_name')->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->fullName(),
            ]);

        $roles = collect(UserRole::cases())->map(fn (UserRole $role) => [
            'value' => $role->value,
            'label' => $role->label(),
        ])->values()->all();

        $ageCategories = AgeCategory::ordered()->get();

        $weightCategories = WeightCategory::ordered()->get();

        $renewalDueCount = Member::where('membership_renewal_date', '<=', Carbon::today()->addDays(30))->count();

        $renewalDueMembers = Member::where('membership_renewal_date', '<=', Carbon::today()->addDays(30))
            ->orderBy('membership_renewal_date')
            ->get(['id', 'first_name', 'last_name', 'email', 'membership_renewal_date'])
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'name' => $m->fullName(),
                'email' => $m->email,
                'membership_renewal_date' => $m->membership_renewal_date->toDateString(),
            ]);

        $trainingGroups = TrainingGroup::with(['trainer:id,name', 'members:id,first_name,last_name', 'schedules'])
            ->orderBy('name')
            ->get()
            ->map(fn (TrainingGroup $g) => [
                'id' => $g->id,
                'name' => $g->name,
                'description' => $g->description,
                'membership_fee' => $g->membership_fee,
                'membership_fee_discount' => $g->membership_fee_discount,
                'schedules' => $g->schedules->map(fn ($s) => [
                    'day' => $s->day,
                    'start_time' => $s->start_time,
                    'end_time' => $s->end_time,
                ])->values()->all(),
                'location' => $g->location,
                'trainer_id' => $g->trainer_id,
                'trainer_name' => $g->trainer?->name,
                'member_ids' => $g->members->pluck('id')->values()->all(),
                'member_count' => $g->members->count(),
            ]);

        $trainers = User::whereNotNull('role')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'role'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'role' => $u->role->value,
            ]);

        $invoices = MembershipInvoice::with(['user:id,name,email', 'lines.member:id,first_name,last_name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (MembershipInvoice $inv) => [
                'id' => $inv->id,
                'user_name' => $inv->user?->name ?? '-',
                'user_email' => $inv->user?->email ?? '-',
                'total_amount' => $inv->total_amount,
                'status' => $inv->status->value,
                'due_date' => $inv->due_date?->toDateString(),
                'paid_at' => $inv->paid_at?->toDateString(),
                'year' => $inv->year,
                'members' => $inv->lines->map(fn ($l) => $l->member?->fullName() ?? '-')->values()->all(),
            ]);

        return Inertia::render('Admin/Dashboard', [
            'pendingUsers' => $pendingUsers,
            'users' => $users,
            'roles' => $roles,
            'ageCategories' => $ageCategories,
            'weightCategories' => $weightCategories,
            'allMembers' => $allMembers,
            'clubSettings' => ClubSettings::current(),
            'renewalDueCount' => $renewalDueCount,
            'renewalDueMembers' => $renewalDueMembers,
            'trainingGroups' => $trainingGroups,
            'trainers' => $trainers,
            'invoices' => $invoices,
        ]);
    }
}
