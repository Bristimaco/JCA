<?php

namespace App\Http\Controllers;

use App\Models\TrainingAttendance;
use App\Models\TrainingSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MemberAttendanceController extends Controller
{
    public function toggle(Request $request, TrainingSession $session): RedirectResponse
    {
        if (! $session->isOpen()) {
            return back()->withErrors(['session' => 'Dit trainingsmoment is niet meer open.']);
        }

        $memberIds = $request->user()->members()->pluck('members.id');

        $groupMemberIds = $session->trainingSchedule->trainingGroup->members()->pluck('members.id');

        $myMemberId = $memberIds->intersect($groupMemberIds)->first();

        if (! $myMemberId) {
            return back()->withErrors(['session' => 'Je bent geen lid van deze trainingsgroep.']);
        }

        $existing = TrainingAttendance::where('training_session_id', $session->id)
            ->where('member_id', $myMemberId)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            TrainingAttendance::create([
                'training_session_id' => $session->id,
                'member_id' => $myMemberId,
                'confirmed_at' => now(),
            ]);
        }

        return back();
    }
}
