<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Models\Member;
use App\Models\Tournament;
use App\Services\MolliePaymentService;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class TournamentRsvpController extends Controller
{
    public function __invoke(string $token, string $response): View
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

        $tournament = Tournament::findOrFail($pivot->tournament_id);
        $member = Member::findOrFail($pivot->member_id);

        if ($tournament->invitation_deadline && now()->startOfDay()->gt($tournament->invitation_deadline)) {
            return view('rsvp-confirmation', [
                'status' => null,
                'tournamentName' => $tournament->name ?? 'Toernooi',
                'memberName' => $member->fullName(),
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
                return view('rsvp-confirmation', [
                    'status' => null,
                    'tournamentName' => $tournament->name ?? 'Toernooi',
                    'memberName' => $member->fullName(),
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

        return view('rsvp-confirmation', [
            'status' => $status,
            'tournamentName' => $tournament->name ?? 'Toernooi',
            'memberName' => $member->fullName(),
            'expired' => false,
        ]);
    }
}
