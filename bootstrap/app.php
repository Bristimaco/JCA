<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsApproved;
use App\Http\Middleware\EnsureUserIsBarmedewerker;
use App\Http\Middleware\EnsureUserIsCoach;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\TrackUserActivity;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->validateCsrfTokens(except: [
            'webhooks/mollie',
            'webhooks/mollie/tournament',
            'webhooks/mollie/event',
            'webhooks/mollie/bar',
            'webhooks/mollie/stage',
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            TrackUserActivity::class,
        ]);

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'approved' => EnsureUserIsApproved::class,
            'barmedewerker' => EnsureUserIsBarmedewerker::class,
            'coach' => EnsureUserIsCoach::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
