<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class VerifyUserEmailController extends Controller
{
    public function __invoke(User $user): RedirectResponse
    {
        if ($user->hasVerifiedEmail()) {
            return back()->with('status', 'Dit e-mailadres is al geverifieerd.');
        }

        $user->markEmailAsVerified();

        return back()->with('status', "E-mailadres van {$user->name} is handmatig geverifieerd.");
    }
}
