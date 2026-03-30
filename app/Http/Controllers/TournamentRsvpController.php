<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Services\MolliePaymentService;
use Illuminate\Support\Facades\DB;

class TournamentRsvpController extends Controller
{
    public function __invoke(string $token, string $response)
    {
        if (! in_array($response, ['accept', 'decline'])) {
            abort(404);
        }

        $pivot = DB::table('member_tournament')
            ->where('invitation_token', $token)
            ->first();

        if (! $pivot) {
            abort(404);
        }

        $tournament = DB::table('tournaments')->where('id', $pivot->tournament_id)->first();

        if ($tournament->invitation_deadline && now()->startOfDay()->gt($tournament->invitation_deadline)) {
            $member = DB::table('members')->where('id', $pivot->member_id)->first();

            return view('rsvp-confirmation', [
                'status' => null,
                'tournamentName' => $tournament->name ?? 'Toernooi',
                'memberName' => ($member->first_name ?? '').' '.($member->last_name ?? ''),
                'expired' => true,
            ]);
        }

        // For paid tournaments: block accept if not yet paid
        if ($response === 'accept' && $pivot->mollie_payment_id) {
            // Sync status from Mollie first
            if ($pivot->payment_status !== 'paid') {
                app(MolliePaymentService::class)->syncTournamentPaymentStatus($pivot->id);
                $pivot = DB::table('member_tournament')->where('id', $pivot->id)->first();
            }

            if ($pivot->payment_status !== 'paid') {
                $member = DB::table('members')->where('id', $pivot->member_id)->first();

                return view('rsvp-confirmation', [
                    'status' => null,
                    'tournamentName' => $tournament->name ?? 'Toernooi',
                    'memberName' => ($member->first_name ?? '').' '.($member->last_name ?? ''),
                    'expired' => false,
                    'paymentRequired' => true,
                    'paymentUrl' => $pivot->mollie_payment_url,
                ]);
            }
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

        $member = DB::table('members')->where('id', $pivot->member_id)->first();

        return view('rsvp-confirmation', [
            'status' => $status,
            'tournamentName' => $tournament->name ?? 'Toernooi',
            'memberName' => ($member->first_name ?? '').' '.($member->last_name ?? ''),
            'expired' => false,
        ]);
    }
}
