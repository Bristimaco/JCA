<?php

namespace App\Http\Controllers;

use App\Models\StageAttachment;
use Illuminate\Http\Response;

class StageAttachmentController extends Controller
{
    public function __invoke(StageAttachment $attachment): Response
    {
        return response($this->decode($attachment->file_data))
            ->header('Content-Type', $attachment->mime_type ?? 'application/octet-stream')
            ->header('Content-Disposition', 'inline; filename="'.$attachment->original_name.'"');
    }

    private function decode(string $data): string
    {
        return base64_decode($data, true) ?: '';
    }
}
