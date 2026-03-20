<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class ApproveUserController extends Controller
{
    public function __invoke(Request $request, User $user): RedirectResponse
    {
        if ($user->isApproved()) {
            return back()->with('status', 'Deze gebruiker is al goedgekeurd.');
        }

        $request->validate([
            'role' => ['required', new Enum(UserRole::class)],
        ]);

        $user->update(['role' => $request->input('role')]);

        return back()->with('status', "{$user->name} is goedgekeurd als {$user->role->label()}.");
    }
}
