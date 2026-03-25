<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Response;

class MemberPhotoController extends Controller
{
    public function __invoke(Member $member): Response
    {
        abort_unless($member->photo_data, 404);

        return response(base64_decode($member->photo_data, true) ?: '')
            ->header('Content-Type', $member->photo_mime ?? 'image/jpeg')
            ->header('Cache-Control', 'private, max-age=86400');
    }
}
