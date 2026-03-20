<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
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

        return Inertia::render('Admin/Dashboard', [
            'pendingUsers' => $pendingUsers,
            'users' => $users,
            'roles' => $roles,
        ]);
    }
}
