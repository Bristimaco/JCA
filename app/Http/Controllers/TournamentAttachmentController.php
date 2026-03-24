<?php

namespace App\Http\Controllers;

use App\Models\TournamentAttachment;
use Illuminate\Http\Response;

class TournamentAttachmentController extends Controller
{
    public function __invoke(TournamentAttachment $attachment): Response
    {
        return response($this->decode($attachment->file_data))
            ->header('Content-Type', $attachment->mime_type ?? 'application/octet-stream')
            ->header('Content-Disposition', 'inline; filename="' . $attachment->original_name . '"');
    }

    private function decode(string $data): string
    {
        return base64_decode($data, true) ?: '';
    }
}
