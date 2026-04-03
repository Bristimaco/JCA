<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsBarmedewerker
{
    public function handle(Request $request, Closure $next, string ...$modules): Response
    {
        $user = $request->user();

        if ($user?->isBarmedewerker() || $user?->isAdmin()) {
            return $next($request);
        }

        foreach ($modules as $module) {
            if ($user?->hasExtraModule($module)) {
                return $next($request);
            }
        }

        abort(403);
    }
}
