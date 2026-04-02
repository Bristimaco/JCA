<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TestModeLog;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminTestModeLogController extends Controller
{
    public function index(): Response
    {
        $logs = TestModeLog::orderByDesc('created_at')
            ->paginate(25)
            ->through(fn ($log) => [
                'id' => $log->id,
                'type' => $log->type,
                'recipient' => $log->recipient,
                'subject' => $log->subject,
                'body' => $log->body,
                'created_at' => $log->created_at->toIso8601String(),
            ]);

        return Inertia::render('Admin/TestModeLog', [
            'logs' => $logs,
        ]);
    }

    public function clear(): RedirectResponse
    {
        TestModeLog::truncate();

        return back()->with('status', 'Test mode log gewist.');
    }
}
