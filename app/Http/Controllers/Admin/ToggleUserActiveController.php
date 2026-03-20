<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ToggleUserActiveController extends Controller
{
    public function __invoke(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('status', 'Je kunt jezelf niet deactiveren.');
        }

        if ($user->isAdmin() && $user->is_active) {
            return back()->with('status', 'Een beheerder kan niet gedeactiveerd worden. Wijzig eerst de rol.');
        }

        $user->update(['is_active' => ! $user->is_active]);

        $action = $user->is_active ? 'geactiveerd' : 'gedeactiveerd';

        return back()->with('status', "{$user->name} is {$action}.");
    }
}
