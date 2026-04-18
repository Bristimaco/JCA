<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;

class ResendVerificationController extends Controller
{
    public function __invoke(User $user): RedirectResponse
    {
        if ($user->hasVerifiedEmail()) {
            return back()->with('status', 'Dit e-mailadres is al geverifieerd.');
        }

        $user->sendEmailVerificationNotification();

        return back()->with('status', "Verificatie-e-mail opnieuw verstuurd naar {$user->email}.");
    }
}
