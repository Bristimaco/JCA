<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $props = [];

        if ($request->user()->isAdmin()) {
            $props['pendingUsers'] = User::whereNull('role')
                ->whereNotNull('email_verified_at')
                ->orderBy('created_at')
                ->get(['id', 'name', 'email', 'created_at']);

            $props['roles'] = collect(UserRole::cases())->map(fn (UserRole $role) => [
                'value' => $role->value,
                'label' => $role->label(),
            ])->values()->all();
        }

        return Inertia::render('Dashboard', $props);
    }
}
