<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Response;

class EventImageController extends Controller
{
    public function __invoke(Event $event): Response
    {
        abort_unless($event->image_data, 404);

        return response(base64_decode($event->image_data, true) ?: '')
            ->header('Content-Type', $event->image_mime ?? 'image/jpeg')
            ->header('Cache-Control', 'private, max-age=86400');
    }
}
