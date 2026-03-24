<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateUserController extends Controller
{
    public function __invoke(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', new Enum(UserRole::class)],
            'results_interest' => ['sometimes', 'boolean'],
        ]);

        if ($user->isAdmin() && $validated['role'] !== UserRole::Admin->value) {
            $otherAdminCount = User::where('role', UserRole::Admin)
                ->where('is_active', true)
                ->where('id', '!=', $user->id)
                ->count();
            if ($otherAdminCount === 0) {
                return back()->with('status', 'Er moet minstens één beheerder actief zijn. Rol kan niet gewijzigd worden.');
            }
        }

        $user->update($validated);

        return back()->with('status', "{$user->name} is bijgewerkt.");
    }
}
