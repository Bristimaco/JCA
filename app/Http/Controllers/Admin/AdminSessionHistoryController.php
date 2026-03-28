<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TrainingSession;
use Inertia\Inertia;
use Inertia\Response;

class AdminSessionHistoryController extends Controller
{
    public function __invoke(): Response
    {
        $sessions = TrainingSession::whereNotNull('closed_at')
            ->with(['trainingSchedule.trainingGroup', 'trainingSchedule.trainer:id,name', 'attendances.member'])
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
                'trainer_name' => $s->trainingSchedule->trainer?->name,
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
}
