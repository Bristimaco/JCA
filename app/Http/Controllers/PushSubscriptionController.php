<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'url:https'],
            'keys.p256dh' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
        ]);

        $request->user()->pushSubscriptions()->updateOrCreate(
            ['endpoint' => $validated['endpoint']],
            [
                'p256dh_key' => $validated['keys']['p256dh'],
                'auth_key' => $validated['keys']['auth'],
            ]
        );

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string'],
        ]);

        $request->user()->pushSubscriptions()
            ->where('endpoint', $validated['endpoint'])
            ->delete();

        return response()->json(['success' => true]);
    }
}
