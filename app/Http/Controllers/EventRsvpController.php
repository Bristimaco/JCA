<?php

namespace App\Http\Controllers;

use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EventRsvpController extends Controller
{
    public function show(Event $event): Response
    {
        $registrationOpen = $event->status === EventStatus::Published;
        abort_unless($registrationOpen || $event->status === EventStatus::RegistrationClosed, 404);

        $registration = null;
        if (auth()->check()) {
            $registration = $event->registrations()
                ->where('user_id', auth()->id())
                ->first();
        }

        return Inertia::render('Events/Register', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'address_street' => $event->address_street,
                'address_city' => $event->address_city,
                'address_postal_code' => $event->address_postal_code,
                'event_date' => $event->event_date->toDateString(),
                'event_time' => $event->event_time,
                'has_image' => $event->hasImage(),
                'price_adult' => (float) $event->price_adult,
                'price_child' => (float) $event->price_child,
            ],
            'registrationOpen' => $registrationOpen,
            'existingRegistration' => $registration ? [
                'adult_count' => $registration->adult_count,
                'child_count' => $registration->child_count,
                'total_amount' => (float) $registration->total_amount,
                'payment_status' => $registration->payment_status,
                'payment_url' => $registration->mollie_payment_url,
            ] : null,
        ]);
    }

    public function store(Request $request, Event $event): RedirectResponse
    {
        abort_unless($event->status === EventStatus::Published, 404);

        $validated = $request->validate([
            'adult_count' => ['required', 'integer', 'min:0'],
            'child_count' => ['required', 'integer', 'min:0'],
        ]);

        $adultCount = (int) $validated['adult_count'];
        $childCount = (int) $validated['child_count'];

        if ($adultCount + $childCount < 1) {
            return back()->withErrors(['adult_count' => 'Selecteer minstens 1 volwassene of 1 kind.']);
        }

        $total = ($adultCount * $event->price_adult) + ($childCount * $event->price_child);

        $existing = $event->registrations()->where('user_id', auth()->id())->first();
        if ($existing && $existing->isPaid()) {
            return back()->withErrors(['adult_count' => 'Je bent al ingeschreven en hebt betaald.']);
        }

        $token = Str::random(64);

        EventRegistration::updateOrCreate(
            ['event_id' => $event->id, 'user_id' => auth()->id()],
            [
                'adult_count' => $adultCount,
                'child_count' => $childCount,
                'total_amount' => $total,
                'rsvp_token' => $token,
                'payment_status' => 'open',
            ],
        );

        return redirect("/evenementen/{$event->id}/bevestiging/{$token}");
    }

    public function confirmation(Event $event, string $token): Response
    {
        $registration = EventRegistration::where('event_id', $event->id)
            ->where('rsvp_token', $token)
            ->firstOrFail();

        return Inertia::render('Events/Confirmation', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'event_date' => $event->event_date->toDateString(),
                'event_time' => $event->event_time,
            ],
            'registration' => [
                'adult_count' => $registration->adult_count,
                'child_count' => $registration->child_count,
                'total_amount' => (float) $registration->total_amount,
                'payment_status' => $registration->payment_status,
                'payment_url' => $registration->mollie_payment_url,
            ],
        ]);
    }
}
