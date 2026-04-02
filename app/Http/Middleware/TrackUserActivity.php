<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            $lastTracked = $request->session()->get('last_activity_tracked');

            if (! $lastTracked || now()->diffInSeconds($lastTracked) >= 60) {
                $request->user()->updateQuietly(['last_active_at' => now()]);
                $request->session()->put('last_activity_tracked', now());
            }
        }

        return $next($request);
    }
}
