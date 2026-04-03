<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\BarOrder;
use App\Models\ClubSettings;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role?->value,
                    'role_label' => $request->user()->role?->label(),
                    'is_approved' => $request->user()->isApproved(),
                    'email_verified' => $request->user()->hasVerifiedEmail(),
                    'notification_preference' => $request->user()->notification_preference?->value ?? 'both',
                    'extra_modules' => $request->user()->extra_modules ?? [],
                ] : null,
            ],
            'unreadNotificationCount' => fn () => $request->user()?->unreadNotifications()->count() ?? 0,
            'flash' => [
                'status' => $request->session()->get('status'),
            ],
            'vapidPublicKey' => config('services.vapid.public_key'),
            'club' => fn () => [
                'name' => ClubSettings::current()->name,
                'has_logo' => (bool) ClubSettings::current()->logo_data,
            ],
            'testMode' => fn () => (bool) ClubSettings::current()->test_mode,
            'pendingBarOrderCount' => fn () => $request->user() && (in_array($request->user()->role, [UserRole::Admin, UserRole::Barmedewerker]) || $request->user()->hasExtraModule('bar'))
                ? BarOrder::pending()->count()
                : 0,
        ];
    }
}
