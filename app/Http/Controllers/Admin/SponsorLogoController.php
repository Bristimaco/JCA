<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Sponsor;
use Illuminate\Http\Response;

class SponsorLogoController extends Controller
{
    public function __invoke(Sponsor $sponsor): Response
    {
        if (! $sponsor->logo_data || ! $sponsor->logo_mime) {
            abort(404);
        }

        $data = base64_decode($sponsor->logo_data, true) ?: '';

        return response($data)
            ->header('Content-Type', $sponsor->logo_mime)
            ->header('Cache-Control', 'public, max-age=86400');
    }
}
