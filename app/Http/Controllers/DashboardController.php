<?php

namespace App\Http\Controllers;

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
            $props['pendingCount'] = User::whereNull('role')
                ->whereNotNull('email_verified_at')
                ->count();
        }

        return Inertia::render('Dashboard', $props);
    }
}
