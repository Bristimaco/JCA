<?php

namespace App\Http\Controllers\Trainer;

use App\Http\Controllers\Controller;
use App\Models\TrainingSchedule;
use App\Models\TrainingSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TrainerAttendanceController extends Controller
{
    public function open(Request $request): RedirectResponse
    {
        $request->validate([
            'training_schedule_id' => ['required', 'exists:training_schedules,id'],
        ]);

        $schedule = TrainingSchedule::findOrFail($request->input('training_schedule_id'));

        if ($schedule->trainer_id !== $request->user()->id) {
            abort(403, 'Je bent niet de trainer van dit trainingsmoment.');
        }

        $today = now()->toDateString();

        $existing = TrainingSession::where('training_schedule_id', $schedule->id)
            ->where('date', $today)
            ->first();

        if ($existing) {
            return back()->withErrors(['session' => 'Er is al een sessie geopend voor dit trainingsmoment vandaag.']);
        }

        TrainingSession::create([
            'training_schedule_id' => $schedule->id,
            'date' => $today,
            'opened_at' => now(),
        ]);

        return back()->with('status', 'Trainingsmoment geopend.');
    }

    public function close(Request $request, TrainingSession $session): RedirectResponse
    {
        $request->validate([
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($session->trainingSchedule->trainer_id !== $request->user()->id) {
            abort(403, 'Je bent niet de trainer van dit trainingsmoment.');
        }

        if (! $session->isOpen()) {
            return back()->withErrors(['session' => 'Dit trainingsmoment is niet open.']);
        }

        $session->update([
            'closed_at' => now(),
            'remarks' => $request->input('remarks'),
        ]);

        return back()->with('status', 'Trainingsmoment afgesloten.');
    }
}
