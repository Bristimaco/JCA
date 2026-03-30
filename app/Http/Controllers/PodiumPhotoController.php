<?php

namespace App\Http\Controllers;

use App\Models\PodiumPhoto;
use Illuminate\Http\Response;

class PodiumPhotoController extends Controller
{
    public function __invoke(PodiumPhoto $podiumPhoto): Response
    {
        return response(base64_decode($podiumPhoto->photo_data, true) ?: '')
            ->header('Content-Type', $podiumPhoto->photo_mime)
            ->header('Content-Disposition', 'inline')
            ->header('Cache-Control', 'private, max-age=86400');
    }
}
