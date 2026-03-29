<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsBarmedewerker
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->isBarmedewerker() && !$request->user()?->isAdmin()) {
            abort(403);
        }

        return $next($request);
    }
}
