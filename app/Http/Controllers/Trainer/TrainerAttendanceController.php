<?php

namespace App\Http\Controllers\Trainer;

use App\Http\Controllers\Controller;
use App\Models\TrainingSchedule;
use App\Models\TrainingSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrainerAttendanceController extends Controller
{
    public function history(Request $request): Response
    {
        $sessions = TrainingSession::whereNotNull('closed_at')
            ->whereHas('trainingSchedule', fn ($q) => $q->where('trainer_id', $request->user()->id))
            ->with(['trainingSchedule.trainingGroup', 'attendances.member'])
            ->orderByDesc('date')
            ->orderByDesc('closed_at')
            ->get()
            ->map(fn (TrainingSession $s) => [
                'id' => $s->id,
                'date' => $s->date->toDateString(),
                'group_name' => $s->trainingSchedule->trainingGroup->name,
                'day' => $s->trainingSchedule->day,
                'start_time' => $s->trainingSchedule->start_time,
                'end_time' => $s->trainingSchedule->end_time,
                'remarks' => $s->remarks,
                'opened_at' => $s->opened_at?->format('H:i'),
                'closed_at' => $s->closed_at?->format('H:i'),
                'attendees' => $s->attendances->map(fn ($a) => [
                    'name' => $a->member->fullName(),
                    'confirmed_at' => $a->confirmed_at->format('H:i'),
                ])->values()->all(),
                'attendance_count' => $s->attendances->count(),
            ]);

        return Inertia::render('Trainer/SessionHistory', [
            'sessions' => $sessions,
        ]);
    }

    public function open(Request $request): RedirectResponse
    {
        $request->validate([
            'training_schedule_id' => ['required', 'exists:training_schedules,id'],
        ]);

        $schedule = TrainingSchedule::findOrFail($request->input('training_schedule_id'));

        if ($schedule->trainer_id !== $request->user()->id) {
            abort(403, 'Je bent niet de trainer van dit trainingsmoment.');
        }

        $todayDay = ucfirst(now()->locale('nl')->isoFormat('dddd'));
        if ($schedule->day !== $todayDay) {
            return back()->withErrors(['session' => 'Je kan enkel trainingen starten op de juiste dag ('.$schedule->day.').']);
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
