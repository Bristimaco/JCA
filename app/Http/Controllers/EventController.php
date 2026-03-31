<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::published()
            ->orderBy('event_date')
            ->get(['id', 'name', 'description', 'address_street', 'address_city', 'address_postal_code', 'event_date', 'event_time', 'image_mime', 'price_adult', 'price_child'])
            ->map(fn (Event $e) => [
                ...$e->toArray(),
                'has_image' => $e->hasImage(),
                'my_registration' => $e->registrations()
                    ->where('user_id', auth()->id())
                    ->first(['payment_status', 'adult_count', 'child_count', 'total_amount']),
            ]);

        return Inertia::render('Events/Index', [
            'events' => $events,
        ]);
    }
}
