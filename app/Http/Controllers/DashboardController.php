<?php

namespace App\Http\Controllers;

use App\Enums\BeltRank;
use App\Enums\EventStatus;
use App\Enums\Gender;
use App\Enums\InvitationStatus;
use App\Enums\InvoiceStatus;
use App\Enums\TournamentStatus;
use App\Enums\VoucherStatus;
use App\Models\Announcement;
use App\Models\BarProduct;
use App\Models\BeltHistory;
use App\Models\Event;
use App\Models\Member;
use App\Models\MembershipInvoice;
use App\Models\Prospect;
use App\Models\Sponsor;
use App\Models\Tournament;
use App\Models\TournamentResult;
use App\Models\TrainingAbsence;
use App\Models\TrainingGroup;
use App\Models\TrainingSchedule;
use App\Models\TrainingSession;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $props = [];

        if ($request->user()->isAdmin()) {
            $props['pendingCount'] = User::whereNull('role')
                ->whereNotNull('email_verified_at')
                ->count();

            $props['pendingUsers'] = User::whereNull('role')
                ->whereNotNull('email_verified_at')
                ->latest()
                ->take(5)
                ->get(['name', 'email', 'created_at'])
                ->map(fn (User $u) => [
                    'name' => $u->name,
                    'email' => $u->email,
                    'created_at' => $u->created_at->toDateString(),
                ]);

            $props['adminCounters'] = [
                'renewalDueCount' => Member::where('membership_renewal_date', '<=', now()->addDays(30))->count(),
                'pendingInvoiceCount' => MembershipInvoice::where('status', InvoiceStatus::Pending)->count(),
                'activeVoucherCount' => Voucher::where('status', VoucherStatus::Active)->where('expires_at', '>=', now())->count(),
                'activeTournamentCount' => Tournament::where('status', '!=', TournamentStatus::Archived)->count(),
                'refillProductCount' => BarProduct::needsRefill()->count(),
                'activeSponsorCount' => Sponsor::active()->count(),
                'activeAnnouncementCount' => Announcement::active()->count(),
                'activeEventCount' => Event::notArchived()->where('status', '!=', EventStatus::Draft)->count(),
                'prospectCount' => Prospect::count(),
            ];

            $props['memberStats'] = $this->memberStats();
        }

        // Upcoming tournaments for admin + coach tile
        if ($request->user()->isAdmin() || $request->user()->isCoach()) {
            $upcomingQuery = Tournament::whereIn('status', [
                TournamentStatus::Preparation,
                TournamentStatus::InvitationsSent,
                TournamentStatus::RegistrationsOpen,
                TournamentStatus::RegistrationsClosed,
            ])
                ->where('tournament_date', '>=', now()->toDateString());

            if ($request->user()->isCoach() && ! $request->user()->isAdmin()) {
                $coachMemberIds = $request->user()->members()->pluck('members.id');
                $upcomingQuery->whereHas('coaches', fn ($q) => $q->whereIn('members.id', $coachMemberIds));
            }

            $props['coachTournamentCount'] = $upcomingQuery->count();

            $props['upcomingTournaments'] = $upcomingQuery
                ->orderBy('tournament_date')
                ->take(3)
                ->get()
                ->map(fn (Tournament $t) => [
                    'id' => $t->id,
                    'name' => $t->name,
                    'tournament_date' => $t->tournament_date->toDateString(),
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                ])
                ->values()
                ->all();
        }

        $props['myEventCount'] = Event::where('status', '!=', EventStatus::Draft)
            ->where('status', '!=', EventStatus::Archived)
            ->where('event_date', '>=', now()->toDateString())
            ->count();

        $props['archivedTournamentCount'] = Tournament::where('status', TournamentStatus::Archived)->count();

        $props['myMemberCount'] = $request->user()->members()->count();

        $props['recentArchived'] = Tournament::whereIn('status', [
            TournamentStatus::Finished,
            TournamentStatus::Archived,
        ])
            ->orderByDesc('tournament_date')
            ->take(3)
            ->get()
            ->map(fn (Tournament $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'tournament_date' => $t->tournament_date->toDateString(),
                'status' => $t->status->value,
                'status_label' => $t->status->label(),
            ]);

        // Active (started) tournaments for all users
        $props['activeTournaments'] = Tournament::where('status', TournamentStatus::Started)
            ->orderByDesc('tournament_date')
            ->get()
            ->map(fn (Tournament $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'tournament_date' => $t->tournament_date->toDateString(),
                'address_street' => $t->address_street,
                'address_postal_code' => $t->address_postal_code,
                'address_city' => $t->address_city,
                'latitude' => $t->latitude,
                'longitude' => $t->longitude,
                'status' => $t->status->value,
                'status_label' => $t->status->label(),
            ]);

        // Coach: load tournaments where the user's members are coaches
        if ($request->user()->isCoach()) {
            $coachMemberIds = $request->user()->members()->pluck('members.id');
            $props['coachTournaments'] = Tournament::whereHas('coaches', fn ($q) => $q->whereIn('members.id', $coachMemberIds))
                ->whereIn('status', [TournamentStatus::Started, TournamentStatus::Finished])
                ->orderByDesc('tournament_date')
                ->get()
                ->map(fn (Tournament $t) => [
                    'id' => $t->id,
                    'name' => $t->name,
                    'tournament_date' => $t->tournament_date->toDateString(),
                    'address_street' => $t->address_street,
                    'address_postal_code' => $t->address_postal_code,
                    'address_city' => $t->address_city,
                    'status' => $t->status->value,
                    'status_label' => $t->status->label(),
                    'participant_count' => $t->members()->count(),
                ]);

            $props['coachTrainingGroups'] = TrainingGroup::whereHas('schedules', fn ($q) => $q->where('trainer_id', $request->user()->id))
                ->with(['members:id,first_name,last_name', 'schedules.trainer:id,name'])
                ->orderBy('name')
                ->get()
                ->map(function (TrainingGroup $g) use ($request) {
                    $scheduleIds = $g->schedules->where('trainer_id', $request->user()->id)->pluck('id');
                    $todaySessions = TrainingSession::whereIn('training_schedule_id', $scheduleIds)
                        ->where('date', now()->toDateString())
                        ->with('attendances')
                        ->get();
                    $todayAbsences = TrainingAbsence::where('date', now()->toDateString())
                        ->whereIn('training_schedule_id', $scheduleIds)
                        ->get();

                    $todayDay = ucfirst(now()->locale('nl')->isoFormat('dddd'));

                    return [
                        'id' => $g->id,
                        'name' => $g->name,
                        'description' => $g->description,
                        'membership_fee' => $g->membership_fee,
                        'schedules' => $g->schedules->map(function ($s) use ($todaySessions, $todayDay, $todayAbsences) {
                            $session = $todaySessions->firstWhere('training_schedule_id', $s->id);

                            return [
                                'id' => $s->id,
                                'day' => $s->day,
                                'start_time' => $s->start_time,
                                'end_time' => $s->end_time,
                                'trainer_name' => $s->trainer?->name,
                                'trainer_id' => $s->trainer_id,
                                'is_today' => $s->day === $todayDay,
                                'session' => $session ? [
                                    'id' => $session->id,
                                    'is_open' => $session->isOpen(),
                                    'attendance_count' => $session->attendances->count(),
                                    'attendee_ids' => $session->attendances->pluck('member_id')->values()->all(),
                                    'notified_absent_ids' => $todayAbsences->where('training_schedule_id', $s->id)->pluck('member_id')->values()->all(),
                                    'closed_at' => $session->closed_at?->toDateTimeString(),
                                ] : null,
                            ];
                        })->values()->all(),
                        'location' => $g->location,
                        'member_ids' => $g->members->pluck('id')->values()->all(),
                        'members' => $g->members->map(fn ($m) => [
                            'id' => $m->id,
                            'name' => $m->fullName(),
                        ])->values()->all(),
                        'member_count' => $g->members->count(),
                    ];
                });

            // Extra trainings for today (coach)
            $props['extraTrainings'] = TrainingSchedule::where('is_extra', true)
                ->where('date', now()->toDateString())
                ->where('trainer_id', $request->user()->id)
                ->with(['trainingGroups.members:id,first_name,last_name', 'trainer:id,name', 'sessions.attendances'])
                ->get()
                ->map(function (TrainingSchedule $s) {
                    $today = now()->toDateString();
                    $session = $s->sessions->first(fn ($sess) => $sess->date->toDateString() === $today);
                    $groupNames = $s->trainingGroups->pluck('name')->join(', ');
                    $allMembers = $s->trainingGroups->flatMap->members->unique('id');

                    return [
                        'id' => $s->id,
                        'name' => $s->name,
                        'date' => $s->date->toDateString(),
                        'start_time' => $s->start_time,
                        'end_time' => $s->end_time,
                        'trainer_name' => $s->trainer?->name,
                        'trainer_id' => $s->trainer_id,
                        'group_names' => $groupNames,
                        'groups' => $s->trainingGroups->map(fn ($g) => ['id' => $g->id, 'name' => $g->name])->values()->all(),
                        'member_count' => $allMembers->count(),
                        'members' => $allMembers->map(fn ($m) => ['id' => $m->id, 'name' => $m->fullName()])->values()->all(),
                        'session' => $session ? [
                            'id' => $session->id,
                            'is_open' => $session->isOpen(),
                            'attendance_count' => $session->attendances->count(),
                            'attendee_ids' => $session->attendances->pluck('member_id')->values()->all(),
                            'closed_at' => $session->closed_at?->toDateTimeString(),
                        ] : null,
                    ];
                })->values()->all();
        }

        // Load tournaments for the user's linked members
        $memberIds = $request->user()->members()->pluck('members.id');

        // Active training sessions for the user's members (one tile per member per session)
        if ($memberIds->isNotEmpty()) {
            $members = $request->user()->members()->get(['members.id', 'members.first_name']);
            $todayAbsences = TrainingAbsence::where('date', now()->toDateString())
                ->whereIn('member_id', $memberIds)
                ->get();
            $props['activeTrainingSessions'] = TrainingSession::whereNull('closed_at')
                ->whereNotNull('opened_at')
                ->where('date', now()->toDateString())
                ->whereHas('trainingSchedule.trainingGroup.members', fn ($q) => $q->whereIn('members.id', $memberIds))
                ->with(['trainingSchedule.trainingGroup.members', 'trainingSchedule.trainer:id,name', 'attendances'])
                ->get()
                ->flatMap(function (TrainingSession $s) use ($members, $todayAbsences) {
                    $groupMemberIds = $s->trainingSchedule->trainingGroup->members->pluck('id');
                    $myMembers = $members->filter(fn ($m) => $groupMemberIds->contains($m->id));

                    return $myMembers->map(fn ($m) => [
                        'session_id' => $s->id,
                        'member_id' => $m->id,
                        'member_name' => $m->first_name,
                        'group_name' => $s->trainingSchedule->trainingGroup->name,
                        'day' => $s->trainingSchedule->day,
                        'start_time' => $s->trainingSchedule->start_time,
                        'end_time' => $s->trainingSchedule->end_time,
                        'trainer_name' => $s->trainingSchedule->trainer?->name,
                        'attending' => $s->attendances->where('member_id', $m->id)->isNotEmpty(),
                        'absent' => $todayAbsences->where('member_id', $m->id)
                            ->where('training_schedule_id', $s->training_schedule_id)
                            ->isNotEmpty(),
                    ]);
                })->values();
        }

        if ($memberIds->isNotEmpty()) {
            $props['myTournaments'] = Tournament::whereHas('members', fn ($q) => $q->whereIn('members.id', $memberIds))
                ->with(['members', 'attachments'])
                ->orderByDesc('tournament_date')
                ->get()
                ->map(function (Tournament $t) use ($memberIds) {
                    $myMember = $t->members->firstWhere(fn ($m) => $memberIds->contains($m->id));

                    return [
                        'id' => $t->id,
                        'name' => $t->name,
                        'tournament_date' => $t->tournament_date->toDateString(),
                        'address_street' => $t->address_street,
                        'address_postal_code' => $t->address_postal_code,
                        'address_city' => $t->address_city,
                        'latitude' => $t->latitude,
                        'longitude' => $t->longitude,
                        'status' => $t->status->value,
                        'status_label' => $t->status->label(),
                        'invitation_status' => $myMember?->pivot->invitation_status,
                        'invitation_status_label' => InvitationStatus::tryFrom($myMember?->pivot->invitation_status)?->label(),
                        'participants' => $t->members
                            ->filter(fn ($m) => $m->pivot->invitation_status === InvitationStatus::Accepted->value)
                            ->map(function ($m) use ($t) {
                                $result = TournamentResult::where('tournament_id', $t->id)
                                    ->where('member_id', $m->id)
                                    ->first();

                                return [
                                    'id' => $m->id,
                                    'name' => $m->fullName(),
                                    'result' => $result?->result,
                                ];
                            })->values()->all(),
                        'attachments' => $t->attachments->map(fn ($a) => [
                            'id' => $a->id,
                            'original_name' => $a->original_name,
                            'url' => route('attachments.show', $a),
                        ])->values()->all(),
                    ];
                });
        }

        return Inertia::render('Dashboard', $props);
    }

    private function memberStats(): array
    {
        $genderCounts = Member::select('gender', DB::raw('count(*) as count'))
            ->groupBy('gender')
            ->pluck('count', 'gender')
            ->all();

        $genderBreakdown = [];
        foreach (Gender::cases() as $g) {
            if (isset($genderCounts[$g->value])) {
                $genderBreakdown[] = ['label' => $g->label(), 'count' => $genderCounts[$g->value]];
            }
        }

        // Current belt per member: latest belt_history entry per member
        $latestBelts = BeltHistory::select('belt_rank', DB::raw('count(*) as count'))
            ->whereIn('id', function ($q) {
                $q->select(DB::raw('max(id)'))
                    ->from('belt_histories')
                    ->groupBy('member_id');
            })
            ->groupBy('belt_rank')
            ->pluck('count', 'belt_rank')
            ->all();

        $beltBreakdown = [];
        foreach (BeltRank::cases() as $b) {
            if (isset($latestBelts[$b->value])) {
                $beltBreakdown[] = ['label' => $b->label(), 'count' => $latestBelts[$b->value]];
            }
        }

        return [
            'total' => Member::count(),
            'gender' => $genderBreakdown,
            'belts' => $beltBreakdown,
        ];
    }
}
