<?php

namespace App\Http\Controllers\Admin;

use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\User;
use App\Notifications\EventInvitationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::orderByDesc('event_date')
            ->get(['id', 'name', 'description', 'address_street', 'address_city', 'address_postal_code', 'event_date', 'event_time', 'image_mime', 'price_adult', 'price_child', 'status', 'created_at'])
            ->map(fn (Event $e) => [
                ...$e->toArray(),
                'has_image' => $e->hasImage(),
                'registration_count' => $e->paidRegistrations()->count(),
                'total_registrations' => $e->registrations()->count(),
            ]);

        return Inertia::render('Admin/Events', [
            'events' => $events,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'event_date' => ['required', 'date'],
            'event_time' => ['nullable', 'date_format:H:i'],
            'price_adult' => ['required', 'numeric', 'min:0'],
            'price_child' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'string'],
        ]);

        $data = collect($validated)->except('image')->toArray();

        if (! empty($validated['image'])) {
            $this->applyImage($data, $validated['image']);
        }

        Event::create($data);

        return back()->with('status', "Evenement '{$validated['name']}' aangemaakt.");
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'event_date' => ['required', 'date'],
            'event_time' => ['nullable', 'date_format:H:i'],
            'price_adult' => ['required', 'numeric', 'min:0'],
            'price_child' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'string'],
            'remove_image' => ['nullable', 'boolean'],
        ]);

        $data = collect($validated)->except(['image', 'remove_image'])->toArray();

        if (! empty($validated['remove_image'])) {
            $data['image_data'] = null;
            $data['image_mime'] = null;
        } elseif (! empty($validated['image'])) {
            $this->applyImage($data, $validated['image']);
        }

        $event->update($data);

        return back()->with('status', "Evenement '{$event->name}' bijgewerkt.");
    }

    public function destroy(Event $event): RedirectResponse
    {
        $name = $event->name;
        $event->delete();

        return back()->with('status', "Evenement '{$name}' verwijderd.");
    }

    public function publish(Event $event): RedirectResponse
    {
        $event->update(['status' => EventStatus::Published]);

        $users = User::whereNotNull('email_verified_at')
            ->whereNotNull('role')
            ->where('is_active', true)
            ->get();

        foreach ($users as $user) {
            $user->notify(new EventInvitationNotification($event));
        }

        return back()->with('status', "Evenement '{$event->name}' gepubliceerd. {$users->count()} uitnodigingen verstuurd.");
    }

    public function archive(Event $event): RedirectResponse
    {
        $event->update(['status' => EventStatus::Archived]);

        return back()->with('status', "Evenement '{$event->name}' gearchiveerd.");
    }

    public function registrations(Event $event): Response
    {
        $registrations = $event->registrations()
            ->with('user:id,name,email')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'user_name' => $r->user->name,
                'user_email' => $r->user->email,
                'adult_count' => $r->adult_count,
                'child_count' => $r->child_count,
                'total_amount' => $r->total_amount,
                'payment_status' => $r->payment_status,
                'paid_at' => $r->paid_at?->toDateTimeString(),
                'created_at' => $r->created_at->toDateTimeString(),
            ]);

        return Inertia::render('Admin/EventRegistrations', [
            'event' => $event->only('id', 'name', 'event_date', 'price_adult', 'price_child'),
            'registrations' => $registrations,
        ]);
    }

    public function markPaid(Event $event, EventRegistration $registration): RedirectResponse
    {
        $registration->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        return back()->with('status', 'Inschrijving als betaald gemarkeerd.');
    }

    private function applyImage(array &$data, string $dataUrl): void
    {
        if (preg_match('/^data:(image\/[a-zA-Z+]+);base64,(.+)$/', $dataUrl, $matches)) {
            $data['image_mime'] = $matches[1];
            $data['image_data'] = $matches[2];
        }
    }
}
