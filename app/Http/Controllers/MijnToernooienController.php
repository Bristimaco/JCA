<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Models\Tournament;
use App\Models\TournamentResult;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MijnToernooienController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $memberIds = $request->user()->members()->pluck('members.id');

        $tournaments = collect();

        if ($memberIds->isNotEmpty()) {
            $tournaments = Tournament::whereHas('members', fn ($q) => $q->whereIn('members.id', $memberIds))
                ->with(['members', 'attachments'])
                ->orderByDesc('tournament_date')
                ->get()
                ->flatMap(function (Tournament $t) use ($memberIds) {
                    $myMembers = $t->members->filter(fn ($m) => $memberIds->contains($m->id));

                    return $myMembers->map(function ($myMember) use ($t) {
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
                            'invitation_status' => $myMember->pivot->invitation_status,
                            'invitation_status_label' => InvitationStatus::tryFrom($myMember->pivot->invitation_status)?->label(),
                            'member_id' => $myMember->id,
                            'member_name' => $myMember->fullName(),
                            'deadline_passed' => $t->invitation_deadline && now()->startOfDay()->gt($t->invitation_deadline),
                            'payment_required' => $myMember->pivot->mollie_payment_id && $myMember->pivot->payment_status !== 'paid',
                            'payment_url' => $myMember->pivot->mollie_payment_url,
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
                })->values();
        }

        return Inertia::render('MijnToernooien', [
            'tournaments' => $tournaments,
        ]);
    }
}
