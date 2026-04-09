<?php

namespace App\Http\Controllers;

use App\Enums\NotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->take(50)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'type' => class_basename($n->type),
                'data' => $n->data,
                'read_at' => $n->read_at?->toIso8601String(),
                'created_at' => $n->created_at->toIso8601String(),
            ]);

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail()
            ->delete();

        return response()->json(['success' => true]);
    }

    public function updatePreference(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'notification_preference' => ['required', Rule::enum(NotificationPreference::class)],
        ]);

        $request->user()->update($validated);

        return back();
    }
}
