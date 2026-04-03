<?php

namespace App\Http\Controllers;

use App\Enums\EventStatus;
use App\Enums\MembershipStatus;
use App\Enums\TournamentStatus;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Member;
use App\Models\Tournament;
use App\Models\TrainingAbsence;
use App\Models\TrainingSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    private const DAY_MAP = [
        'Maandag' => Carbon::MONDAY,
        'Dinsdag' => Carbon::TUESDAY,
        'Woensdag' => Carbon::WEDNESDAY,
        'Donderdag' => Carbon::THURSDAY,
        'Vrijdag' => Carbon::FRIDAY,
        'Zaterdag' => Carbon::SATURDAY,
        'Zondag' => Carbon::SUNDAY,
    ];

    public function __invoke(Request $request): Response
    {
        $start = $request->query('start')
            ? Carbon::parse($request->query('start'))->startOfWeek(Carbon::MONDAY)
            : Carbon::now()->startOfWeek(Carbon::MONDAY);

        $end = $start->copy()->addDays(27)->endOfDay();

        $memberIds = $request->user()->members()->pluck('members.id');
        $userId = $request->user()->id;

        $items = collect()
            ->merge($this->trainingItems($start, $end, $memberIds))
            ->merge($this->extraTrainingItems($start, $end, $memberIds))
            ->merge($this->tournamentItems($start, $end, $memberIds))
            ->merge($this->eventItems($start, $end, $userId))
            ->merge($this->birthdayItems($start, $end))
            ->sortBy('date')
            ->values();

        return Inertia::render('Calendar', [
            'items' => $items,
            'startDate' => $start->toDateString(),
            'myMemberIds' => $memberIds->values()->all(),
        ]);
    }

    private function trainingItems(Carbon $start, Carbon $end, $memberIds): array
    {
        $schedules = TrainingSchedule::where('is_extra', false)
            ->with('trainingGroup.members:id,first_name,last_name')
            ->get();
        $items = [];

        // Fetch absences for all relevant members and dates in this range
        $absences = TrainingAbsence::whereIn('member_id', $memberIds)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()
            ->groupBy(fn ($a) => $a->training_schedule_id.'|'.$a->date->toDateString());

        foreach ($schedules as $schedule) {
            $dayNumber = self::DAY_MAP[$schedule->day] ?? null;
            if ($dayNumber === null) {
                continue;
            }

            $date = $start->copy()->next($dayNumber);
            if ($date->lt($start)) {
                $date = $start->copy()->next($dayNumber);
            }
            // Find first occurrence on or after $start
            $date = $start->copy();
            if ($date->dayOfWeekIso !== $dayNumber) {
                $date = $date->next($dayNumber);
            }

            while ($date->lte($end)) {
                $groupMemberIds = $schedule->trainingGroup->members->pluck('id');
                $participatingMemberIds = $memberIds->intersect($groupMemberIds);

                $participatingMembers = $schedule->trainingGroup->members
                    ->whereIn('id', $participatingMemberIds)
                    ->map(fn ($m) => ['id' => $m->id, 'first_name' => $m->first_name])
                    ->values()
                    ->all();

                // Find absentees for this schedule/date
                $absenceKey = $schedule->id.'|'.$date->toDateString();
                $absentMembers = isset($absences[$absenceKey])
                    ? collect($absences[$absenceKey])->map(fn ($a) => [
                        'id' => $a->member_id,
                        'first_name' => $schedule->trainingGroup->members->firstWhere('id', $a->member_id)?->first_name,
                        'reason' => $a->reason,
                    ])->values()->all()
                    : [];

                $items[] = [
                    'type' => 'training',
                    'date' => $date->toDateString(),
                    'name' => $schedule->trainingGroup->name,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'location' => $schedule->trainingGroup->location,
                    'participating' => $participatingMemberIds->isNotEmpty(),
                    'participating_members' => $participatingMembers,
                    'training_schedule_id' => $schedule->id,
                    'absent_members' => $absentMembers,
                ];

                $date = $date->copy()->addWeek();
            }
        }

        return $items;
    }

    private function extraTrainingItems(Carbon $start, Carbon $end, $memberIds): array
    {
        $schedules = TrainingSchedule::where('is_extra', true)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->with('trainingGroups.members:id,first_name,last_name')
            ->get();

        $items = [];

        $absences = TrainingAbsence::whereIn('member_id', $memberIds)
            ->whereIn('training_schedule_id', $schedules->pluck('id'))
            ->get()
            ->groupBy(fn ($a) => $a->training_schedule_id.'|'.$a->date->toDateString());

        foreach ($schedules as $schedule) {
            $allMembers = $schedule->trainingGroups->flatMap->members->unique('id');
            $groupMemberIds = $allMembers->pluck('id');
            $participatingMemberIds = $memberIds->intersect($groupMemberIds);

            $participatingMembers = $allMembers
                ->whereIn('id', $participatingMemberIds)
                ->map(fn ($m) => ['id' => $m->id, 'first_name' => $m->first_name])
                ->values()
                ->all();

            $absenceKey = $schedule->id.'|'.$schedule->date->toDateString();
            $absentMembers = isset($absences[$absenceKey])
                ? collect($absences[$absenceKey])->map(fn ($a) => [
                    'id' => $a->member_id,
                    'first_name' => $allMembers->firstWhere('id', $a->member_id)?->first_name,
                    'reason' => $a->reason,
                ])->values()->all()
                : [];

            $items[] = [
                'type' => 'extra_training',
                'date' => $schedule->date->toDateString(),
                'name' => $schedule->name.' ('.$schedule->trainingGroups->pluck('name')->join(', ').')',
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'location' => $schedule->trainingGroups->first()?->location,
                'participating' => $participatingMemberIds->isNotEmpty(),
                'participating_members' => $participatingMembers,
                'training_schedule_id' => $schedule->id,
                'absent_members' => $absentMembers,
            ];
        }

        return $items;
    }

    private function tournamentItems(Carbon $start, Carbon $end, $memberIds): array
    {
        $tournaments = Tournament::whereBetween('tournament_date', [$start->toDateString(), $end->toDateString()])
            ->where('status', '!=', TournamentStatus::Archived)
            ->get();

        return $tournaments->map(function (Tournament $t) use ($memberIds) {
            $participating = $t->members()
                ->whereIn('members.id', $memberIds)
                ->whereIn('member_tournament.invitation_status', ['accepted', 'invited'])
                ->exists();

            return [
                'type' => 'tournament',
                'id' => $t->id,
                'date' => $t->tournament_date instanceof Carbon ? $t->tournament_date->toDateString() : $t->tournament_date,
                'name' => $t->name,
                'city' => $t->address_city,
                'status' => $t->status->value,
                'participating' => $participating,
            ];
        })->all();
    }

    private function eventItems(Carbon $start, Carbon $end, int $userId): array
    {
        $events = Event::whereBetween('event_date', [$start->toDateString(), $end->toDateString()])
            ->whereIn('status', [EventStatus::Published, EventStatus::RegistrationClosed])
            ->get();

        $registeredEventIds = EventRegistration::where('user_id', $userId)
            ->whereIn('event_id', $events->pluck('id'))
            ->pluck('event_id');

        return $events->map(function (Event $e) use ($registeredEventIds) {
            return [
                'type' => 'event',
                'id' => $e->id,
                'date' => $e->event_date instanceof Carbon ? $e->event_date->toDateString() : $e->event_date,
                'name' => $e->name,
                'time' => $e->event_time,
                'city' => $e->address_city,
                'participating' => $registeredEventIds->contains($e->id),
            ];
        })->all();
    }

    private function birthdayItems(Carbon $start, Carbon $end): array
    {
        $members = Member::whereNotNull('date_of_birth')
            ->where('membership_status', MembershipStatus::Active)
            ->get(['id', 'first_name', 'last_name', 'date_of_birth']);

        $items = [];
        $current = $start->copy();

        while ($current->lte($end)) {
            foreach ($members as $member) {
                if ($member->date_of_birth->month === $current->month && $member->date_of_birth->day === $current->day) {
                    $age = $member->date_of_birth->diffInYears($current);
                    $items[] = [
                        'type' => 'birthday',
                        'date' => $current->toDateString(),
                        'name' => $member->first_name.' '.$member->last_name.' ('.$age.')',
                    ];
                }
            }
            $current->addDay();
        }

        return $items;
    }
}
