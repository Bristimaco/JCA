<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Models\Member;
use App\Models\Stage;
use App\Services\MolliePaymentService;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class StageRsvpController extends Controller
{
    public function __invoke(string $token, string $response): View
    {
        if (! in_array($response, ['accept', 'decline'])) {
            abort(404);
        }

        $pivot = DB::table('member_stage')
            ->where('invitation_token', $token)
            ->first();

        if (! $pivot) {
            abort(404);
        }

        $stage = Stage::findOrFail($pivot->stage_id);
        $member = Member::findOrFail($pivot->member_id);

        if ($stage->invitation_deadline && now()->startOfDay()->gt($stage->invitation_deadline)) {
            return view('rsvp-confirmation', [
                'status' => null,
                'tournamentName' => $stage->name ?? 'Stage',
                'memberName' => $member->fullName(),
                'expired' => true,
            ]);
        }

        if ($response === 'accept' && $pivot->mollie_payment_id) {
            if ($pivot->payment_status !== 'paid') {
                app(MolliePaymentService::class)->syncStagePaymentStatus($pivot->id);
                $pivot = DB::table('member_stage')->where('id', $pivot->id)->first();
            }

            if ($pivot->payment_status !== 'paid') {
                return view('rsvp-confirmation', [
                    'status' => null,
                    'tournamentName' => $stage->name ?? 'Stage',
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

        DB::table('member_stage')
            ->where('id', $pivot->id)
            ->update([
                'invitation_status' => $status->value,
                'responded_at' => now(),
            ]);

        return view('rsvp-confirmation', [
            'status' => $status,
            'tournamentName' => $stage->name ?? 'Stage',
            'memberName' => $member->fullName(),
            'expired' => false,
        ]);
    }
}
