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
            ->with(['trainingSchedule.trainingGroup.members', 'trainingSchedule.trainingGroups.members', 'trainingSchedule.trainer:id,name', 'attendances.member', 'externalAttendances.club'])
            ->orderByDesc('date')
            ->orderByDesc('closed_at')
            ->get()
            ->map(function (TrainingSession $s) {
                $schedule = $s->trainingSchedule;
                $isExtra = $schedule->is_extra;

                $groupMembers = $isExtra
                    ? $schedule->trainingGroups->flatMap->members->unique('id')
                    : ($schedule->trainingGroup?->members ?? collect());

                $groupName = $isExtra
                    ? $schedule->name.' ('.$schedule->trainingGroups->pluck('name')->join(', ').')'
                    : ($schedule->trainingGroup?->name ?? 'Onbekend');

                $attendeeIds = $s->attendances->pluck('member_id')->all();
                $absentees = $groupMembers
                    ->filter(fn ($m) => ! in_array($m->id, $attendeeIds))
                    ->map(fn ($m) => ['name' => $m->fullName()])
                    ->values()->all();

                return [
                    'id' => $s->id,
                    'date' => $s->date->toDateString(),
                    'group_name' => $groupName,
                    'is_extra' => $isExtra,
                    'day' => $schedule->day,
                    'start_time' => $s->trainingSchedule->start_time,
                    'end_time' => $s->trainingSchedule->end_time,
                    'trainer_name' => $s->trainingSchedule->trainer?->name,
                    'remarks' => $s->remarks,
                    'opened_at' => $s->opened_at?->format('H:i'),
                    'closed_at' => $s->closed_at?->format('H:i'),
                    'attendees' => $s->attendances->map(fn ($a) => [
                        'name' => $a->member?->fullName() ?? 'Verwijderd lid',
                        'confirmed_at' => $a->confirmed_at?->format('H:i'),
                    ])->values()->all(),
                    'attendance_count' => $s->attendances->count() + $s->externalAttendances->count(),
                    'absentees' => $absentees,
                    'external_attendees' => $s->externalAttendances->map(fn ($e) => [
                        'name' => $e->name,
                        'belt_color' => $e->belt_color,
                        'club_name' => $e->club?->name ?? 'Onbekend',
                        'confirmed_at' => $e->confirmed_at?->format('H:i'),
                    ])->values()->all(),
                ];
            });

        return Inertia::render('Trainer/SessionHistory', [
            'sessions' => $sessions,
        ]);
    }
}
