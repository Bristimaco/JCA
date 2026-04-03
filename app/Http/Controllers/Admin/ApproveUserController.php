<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ExtraModule;
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
            'extra_modules' => ['nullable', 'array'],
            'extra_modules.*' => [new Enum(ExtraModule::class)],
        ]);

        $user->update([
            'role' => $request->input('role'),
            'extra_modules' => $request->input('extra_modules', []),
        ]);

        return back()->with('status', "{$user->name} is goedgekeurd als {$user->role->label()}.");
    }
}
