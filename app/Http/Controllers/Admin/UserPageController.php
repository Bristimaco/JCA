<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ExtraModule;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class UserPageController extends Controller
{
    public function __invoke(): Response
    {
        $unverifiedUsers = User::whereNull('email_verified_at')
            ->orderBy('created_at')
            ->get(['id', 'name', 'email', 'created_at']);

        $pendingUsers = User::whereNull('role')
            ->whereNotNull('email_verified_at')
            ->orderBy('created_at')
            ->get(['id', 'name', 'email', 'created_at']);

        $users = User::whereNotNull('role')
            ->with('members:id')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'results_interest', 'extra_modules'])
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

        $extraModules = collect(ExtraModule::cases())->map(fn (ExtraModule $m) => [
            'value' => $m->value,
            'label' => $m->label(),
        ])->values()->all();

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

        return Inertia::render('Admin/Users', [
            'unverifiedUsers' => $unverifiedUsers,
            'pendingUsers' => $pendingUsers,
            'users' => $users,
            'roles' => $roles,
            'extraModules' => $extraModules,
            'allMembers' => $allMembers,
            'renewalDueCount' => $renewalDueCount,
            'renewalDueMembers' => $renewalDueMembers,
        ]);
    }
}
