<?php

namespace App\Http\Controllers;

use App\Enums\BeltRank;
use App\Enums\EventStatus;
use App\Enums\Gender;
use App\Enums\InvoiceStatus;
use App\Enums\StageStatus;
use App\Enums\TournamentStatus;
use App\Enums\VoucherStatus;
use App\Models\Announcement;
use App\Models\BarOrder;
use App\Models\BarProduct;
use App\Models\BeltHistory;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Member;
use App\Models\MembershipInvoice;
use App\Models\Prospect;
use App\Models\Sponsor;
use App\Models\Stage;
use App\Models\Tournament;
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
        $user = $request->user();

        if ($user->isAdmin() || $user->hasExtraModule('admin')) {
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
        }

        // Admin counters — build selectively based on role + extra modules
        $adminCounters = [];

        if ($user->isAdmin() || $user->hasExtraModule('members')) {
            $adminCounters['renewalDueCount'] = Member::where('membership_renewal_date', '<=', now()->addDays(30))->count();
            $adminCounters['pendingInvoiceCount'] = MembershipInvoice::where('status', InvoiceStatus::Pending)->count();
            $adminCounters['activeVoucherCount'] = Voucher::where('status', VoucherStatus::Active)->where('expires_at', '>=', now())->count();
        }

        if ($user->isAdmin() || $user->hasExtraModule('tournaments')) {
            $adminCounters['activeTournamentCount'] = Tournament::where('status', '!=', TournamentStatus::Archived)->count();
        }

        if ($user->isAdmin() || $user->hasExtraModule('training')) {
            $adminCounters['activeStageCount'] = Stage::where('status', '!=', StageStatus::Archived)->count();
            $adminCounters['archivedStageCount'] = Stage::where('status', StageStatus::Archived)->count();
        }

        if ($user->isAdmin() || $user->hasExtraModule('bar')) {
            $adminCounters['refillProductCount'] = BarProduct::needsRefill()->count();
        }

        if ($user->isAdmin() || $user->hasExtraModule('sponsors')) {
            $adminCounters['activeSponsorCount'] = Sponsor::active()->count();
            $adminCounters['prospectCount'] = Prospect::count();
        }

        if ($user->isAdmin() || $user->hasExtraModule('announcements')) {
            $adminCounters['activeAnnouncementCount'] = Announcement::active()->count();
        }

        if ($user->isAdmin() || $user->hasExtraModule('events')) {
            $adminCounters['activeEventCount'] = Event::notArchived()->where('status', '!=', EventStatus::Draft)->count();
        }

        if (! empty($adminCounters)) {
            $props['adminCounters'] = $adminCounters;
        }

        if ($user->isAdmin() || $user->hasExtraModule('members')) {
            $props['memberStats'] = $this->memberStats();
        }

        // Bar counters for barmedewerker + admin + extra module
        if ($user->isAdmin() || $user->isBarmedewerker() || $user->hasExtraModule('bar')) {
            $props['barCounters'] = [
                'pendingOrderCount' => BarOrder::pending()->count(),
                'unpaidPoefCount' => BarOrder::unpaidPoef()->count(),
            ];
        }

        // Upcoming tournaments for admin + coach + extra module
        if ($user->isAdmin() || $user->isCoach() || $user->hasExtraModule('tournaments')) {
            $upcomingQuery = Tournament::whereIn('status', [
                TournamentStatus::Preparation,
                TournamentStatus::InvitationsSent,
                TournamentStatus::RegistrationsOpen,
                TournamentStatus::RegistrationsClosed,
            ])
                ->where('tournament_date', '>=', now()->toDateString());

            if ($user->isCoach() && ! $user->isAdmin()) {
                $coachMemberIds = $user->members()->pluck('members.id');
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

        $userRegisteredEventIds = EventRegistration::where('user_id', $user->id)->pluck('event_id');

        $props['invitedEventCount'] = Event::where('status', EventStatus::Published)
            ->where('event_date', '>=', now()->toDateString())
            ->whereNotIn('id', $userRegisteredEventIds)
            ->count();

        $props['registeredEventCount'] = EventRegistration::where('user_id', $user->id)
            ->where('payment_status', '!=', 'paid')
            ->whereHas('event', fn ($q) => $q->where('event_date', '>=', now()->toDateString()))
            ->count();

        $props['paidEventCount'] = EventRegistration::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->count();

        $props['archivedTournamentCount'] = Tournament::where('status', TournamentStatus::Archived)->count();

        $props['myMemberCount'] = $user->members()->count();

        $props['myPoefCount'] = BarOrder::unpaidPoef()
            ->where('ordered_by_user_id', $user->id)
            ->count();

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
        if ($user->isCoach()) {
            $coachMemberIds = $user->members()->pluck('members.id');
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

            $props['coachTrainingGroups'] = TrainingGroup::whereHas('schedules', fn ($q) => $q->where('trainer_id', $user->id))
                ->with(['members:id,first_name,last_name', 'schedules.trainer:id,name'])
                ->orderBy('name')
                ->get()
                ->map(function (TrainingGroup $g) use ($user) {
                    $scheduleIds = $g->schedules->where('trainer_id', $user->id)->pluck('id');
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
                ->where('trainer_id', $user->id)
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
        $memberIds = $user->members()->pluck('members.id');

        // Active training sessions for the user's members (one tile per member per session)
        if ($memberIds->isNotEmpty()) {
            $members = $user->members()->get(['members.id', 'members.first_name']);
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
            $props['myTournamentCount'] = DB::table('member_tournament')->whereIn('member_id', $memberIds)->count();

            $props['membersWithNutritionPlan'] = $user->members()
                ->whereHas('nutritionPlan')
                ->with('nutritionPlan')
                ->get(['members.id', 'first_name', 'last_name'])
                ->map(function (Member $m) {
                    $todayEntries = $m->foodDiaryEntries()
                        ->where('date', now()->toDateString())
                        ->with('foodProduct:id,calories')
                        ->get();

                    $totalCalories = $todayEntries->sum(fn ($e) => round((float) $e->grams / 100 * (float) $e->foodProduct->calories, 1));

                    return [
                        'id' => $m->id,
                        'name' => $m->fullName(),
                        'total_calories' => round($totalCalories, 1),
                        'max_calories' => (float) $m->nutritionPlan->max_calories,
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
