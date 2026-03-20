<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AgeCategory;
use App\Models\Member;
use App\Models\User;
use App\Models\WeightCategory;
use Illuminate\Http\Request;
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
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'is_active']);

        $roles = collect(UserRole::cases())->map(fn (UserRole $role) => [
            'value' => $role->value,
            'label' => $role->label(),
        ])->values()->all();

        $ageCategories = AgeCategory::ordered()->get();

        $weightCategories = WeightCategory::ordered()->get();

        $members = Member::orderBy('last_name')->orderBy('first_name')->get()
            ->map(fn (Member $m) => [
                ...$m->toArray(),
                'photo_url' => $m->photo_path ? asset('storage/'.$m->photo_path) : null,
            ]);

        return Inertia::render('Admin/Dashboard', [
            'pendingUsers' => $pendingUsers,
            'users' => $users,
            'roles' => $roles,
            'ageCategories' => $ageCategories,
            'weightCategories' => $weightCategories,
            'members' => $members,
        ]);
    }
}
