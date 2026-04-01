<?php

namespace App\Http\Controllers;

use App\Models\ClubSettings;
use App\Models\TrainingAbsence;
use App\Models\TrainingGroup;
use App\Models\TrainingSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceReportController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $months = (int) $request->query('months', 12);
        $since = $months > 0 ? now()->subMonths($months)->startOfDay() : null;

        $isAdmin = $request->user()->isAdmin();

        $groupQuery = TrainingGroup::with(['members:id,first_name,last_name', 'schedules'])
            ->orderBy('name');

        if (!$isAdmin) {
            $groupQuery->whereHas('schedules', fn($q) => $q->where('trainer_id', $request->user()->id));
        }

        $groups = $groupQuery->get();

        $threshold = ClubSettings::current()->attendance_threshold ?? 70;

        $report = $groups->map(function (TrainingGroup $group) use ($since, $isAdmin, $request) {
            $scheduleIds = $isAdmin
                ? $group->schedules->pluck('id')
                : $group->schedules->where('trainer_id', $request->user()->id)->pluck('id');

            $sessionsQuery = TrainingSession::whereIn('training_schedule_id', $scheduleIds)
                ->whereNotNull('closed_at');

            if ($since) {
                $sessionsQuery->where('date', '>=', $since->toDateString());
            }

            $sessions = $sessionsQuery->orderBy('date')->with('attendances')->get();

            if ($sessions->isEmpty()) {
                return null;
            }

            $sessionDates = $sessions->map(fn(TrainingSession $s) => [
                'id' => $s->id,
                'date' => $s->date->toDateString(),
            ])->values()->all();

            $totalSessions = $sessions->count();

            $absences = TrainingAbsence::whereIn('training_schedule_id', $scheduleIds)
                ->whereIn('date', $sessions->pluck('date')->map(fn($d) => $d->toDateString())->unique())
                ->get();

            $members = $group->members->map(function ($member) use ($sessions, $totalSessions, $absences) {
                $attendedSessionIds = $sessions
                    ->filter(fn(TrainingSession $s) => $s->attendances->contains('member_id', $member->id))
                    ->pluck('id')
                    ->all();

                $notifiedAbsentSessionIds = $sessions
                    ->filter(
                        fn(TrainingSession $s) => !$s->attendances->contains('member_id', $member->id)
                        && $absences->filter(
                            fn($a) => $a->member_id === $member->id
                            && $a->training_schedule_id === $s->training_schedule_id
                            && $a->date->toDateString() === $s->date->toDateString()
                        )->isNotEmpty()
                    )
                    ->pluck('id')
                    ->all();

                $attendedCount = count($attendedSessionIds);
                $percentage = $totalSessions > 0 ? round(($attendedCount / $totalSessions) * 100) : 0;

                return [
                    'id' => $member->id,
                    'name' => $member->fullName(),
                    'attended_session_ids' => $attendedSessionIds,
                    'notified_absent_session_ids' => $notifiedAbsentSessionIds,
                    'attended_count' => $attendedCount,
                    'percentage' => $percentage,
                ];
            })->sortByDesc('percentage')->values()->all();

            return [
                'id' => $group->id,
                'name' => $group->name,
                'sessions' => $sessionDates,
                'total_sessions' => $totalSessions,
                'members' => $members,
            ];
        })->filter()->values()->all();

        return Inertia::render('Trainer/AttendanceReport', [
            'report' => $report,
            'threshold' => $threshold,
            'months' => $months,
        ]);
    }
}
