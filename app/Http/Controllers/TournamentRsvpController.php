<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use Illuminate\Support\Facades\DB;

class TournamentRsvpController extends Controller
{
    public function __invoke(string $token, string $response)
    {
        if (!in_array($response, ['accept', 'decline'])) {
            abort(404);
        }

        $pivot = DB::table('member_tournament')
            ->where('invitation_token', $token)
            ->first();

        if (!$pivot) {
            abort(404);
        }

        $status = $response === 'accept'
            ? InvitationStatus::Accepted
            : InvitationStatus::Declined;

        DB::table('member_tournament')
            ->where('id', $pivot->id)
            ->update([
                'invitation_status' => $status->value,
                'responded_at' => now(),
            ]);

        $tournament = DB::table('tournaments')->where('id', $pivot->tournament_id)->first();
        $member = DB::table('members')->where('id', $pivot->member_id)->first();

        return view('rsvp-confirmation', [
            'status' => $status,
            'tournamentName' => $tournament->name ?? 'Toernooi',
            'memberName' => ($member->first_name ?? '') . ' ' . ($member->last_name ?? ''),
        ]);
    }
}
