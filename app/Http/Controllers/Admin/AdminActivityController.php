<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $activeSessions = User::where('last_active_at', '>=', now()->subMinutes(15))
            ->orderByDesc('last_active_at')
            ->get(['id', 'name', 'email', 'role', 'last_active_at']);

        $inactiveDays = (int) $request->query('inactive_days', 30);

        $inactiveUsers = User::where(function ($query) use ($inactiveDays) {
            $query->where('last_active_at', '<', now()->subDays($inactiveDays))
                ->orWhereNull('last_active_at');
        })
            ->whereNotNull('role')
            ->where('is_active', true)
            ->orderBy('last_active_at')
            ->get(['id', 'name', 'email', 'role', 'last_active_at']);

        $loginLogs = LoginLog::with('user:id,name,email,role')
            ->orderByDesc('logged_in_at')
            ->paginate(25)
            ->through(fn ($log) => [
                'id' => $log->id,
                'user_name' => $log->user->name,
                'user_email' => $log->user->email,
                'user_role' => $log->user->role?->value,
                'logged_in_at' => $log->logged_in_at->toIso8601String(),
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
            ]);

        return Inertia::render('Admin/Activity', [
            'activeSessions' => $activeSessions->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role?->value,
                'last_active_at' => $user->last_active_at->toIso8601String(),
            ]),
            'inactiveUsers' => $inactiveUsers->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role?->value,
                'last_active_at' => $user->last_active_at?->toIso8601String(),
            ]),
            'loginLogs' => $loginLogs,
            'inactiveDays' => $inactiveDays,
        ]);
    }
}
