<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClubSettings;
use Inertia\Inertia;
use Inertia\Response;

class ClubSettingsPageController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/ClubSettings', [
            'clubSettings' => ClubSettings::current(),
        ]);
    }
}
