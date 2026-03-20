<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserMembersController extends Controller
{
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'member_ids' => ['present', 'array'],
            'member_ids.*' => ['integer', 'exists:members,id'],
        ]);

        $user->members()->sync($validated['member_ids']);

        return back()->with('status', "Leden van {$user->name} bijgewerkt.");
    }
}
