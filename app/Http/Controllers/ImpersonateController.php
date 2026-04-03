<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ImpersonateController extends Controller
{
    public function start(User $user): RedirectResponse
    {
        abort_if(session()->has('impersonate_original_id'), 403, 'Je bent al aan het impersonaten.');
        abort_if($user->id === Auth::id(), 403, 'Je kunt jezelf niet impersonaten.');

        session()->put('impersonate_original_id', Auth::id());

        Auth::login($user);

        return redirect('/');
    }

    public function stop(): RedirectResponse
    {
        $originalId = session()->pull('impersonate_original_id');

        abort_unless($originalId, 403);

        Auth::login(User::findOrFail($originalId));

        return redirect('/admin/gebruikers');
    }
}
