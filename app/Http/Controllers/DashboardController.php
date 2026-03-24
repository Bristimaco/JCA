<?php

namespace App\Http\Controllers;

use App\Enums\BeltRank;
use App\Enums\Gender;
use App\Enums\InvitationStatus;
use App\Enums\MembershipStatus;
use App\Enums\TournamentStatus;
use App\Models\BeltHistory;
use App\Models\Member;
use App\Models\Tournament;
use App\Models\TournamentResult;
use App\Models\User;
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
                'inactiveMemberCount' => Member::where('membership_status', MembershipStatus::Inactive)->count(),
                'upcomingTournamentCount' => Tournament::whereIn('status', [
                    TournamentStatus::Preparation,
                    TournamentStatus::InvitationsSent,
                    TournamentStatus::RegistrationsOpen,
                    TournamentStatus::RegistrationsClosed,
                ])->count(),
                'activeTournamentCount' => Tournament::where('status', TournamentStatus::Started)->count(),
            ];

            $props['memberStats'] = $this->memberStats();
        }

        $props['myMemberCount'] = $request->user()->members()->count();

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
        }

        // Load tournaments for the user's linked members
        $memberIds = $request->user()->members()->pluck('members.id');
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
