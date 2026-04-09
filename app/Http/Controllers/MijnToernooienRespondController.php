<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Models\Member;
use App\Models\Tournament;
use App\Services\MolliePaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MijnToernooienRespondController extends Controller
{
    public function __invoke(Request $request, Tournament $tournament, Member $member): RedirectResponse
    {
        $request->validate([
            'response' => ['required', 'in:accept,decline'],
        ]);

        abort_unless(
            $request->user()->members()->where('members.id', $member->id)->exists(),
            403,
        );

        $pivot = DB::table('member_tournament')
            ->where('tournament_id', $tournament->id)
            ->where('member_id', $member->id)
            ->where('invitation_status', InvitationStatus::Invited->value)
            ->first();

        abort_unless($pivot, 404);

        if ($tournament->invitation_deadline && now()->startOfDay()->gt($tournament->invitation_deadline)) {
            return back()->with('error', 'De deadline voor dit toernooi is verlopen.');
        }

        if ($request->input('response') === 'accept' && $pivot->mollie_payment_id) {
            if ($pivot->payment_status !== 'paid') {
                app(MolliePaymentService::class)->syncTournamentPaymentStatus($pivot->id);
                $pivot = DB::table('member_tournament')->where('id', $pivot->id)->first();
            }

            if ($pivot->payment_status !== 'paid') {
                return back()->with('error', 'Betaling is nog niet ontvangen. Betaal eerst via de betaallink.');
            }
        }

        $status = $request->input('response') === 'accept'
            ? InvitationStatus::Accepted
            : InvitationStatus::Declined;

        DB::table('member_tournament')
            ->where('id', $pivot->id)
            ->update([
                'invitation_status' => $status->value,
                'responded_at' => now(),
            ]);

        return back();
    }
}
