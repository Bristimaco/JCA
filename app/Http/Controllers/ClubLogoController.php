<?php

namespace App\Http\Controllers;

use App\Models\ClubSettings;
use Illuminate\Http\Response;

class ClubLogoController extends Controller
{
    public function __invoke(): Response
    {
        $settings = ClubSettings::current();

        if (!$settings->hasLogo()) {
            abort(404);
        }

        $data = base64_decode($settings->logo_data, true) ?: '';

        return response($data)
            ->header('Content-Type', $settings->logo_mime_type ?? 'image/png')
            ->header('Cache-Control', 'public, max-age=86400');
    }
}
