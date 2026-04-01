<?php

namespace App\Http\Controllers;

use App\Models\TrainingAbsence;
use Illuminate\Http\Request;

class TrainingAbsenceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'required|integer',
            'training_schedule_id' => 'required|exists:training_schedules,id',
            'date' => 'required|date',
            'reason' => 'nullable|string|max:255',
        ]);

        $userMemberIds = $request->user()->members()->pluck('members.id');
        if (! $userMemberIds->contains($validated['member_id'])) {
            abort(403, 'Je hebt geen toegang tot dit lid.');
        }

        $absence = TrainingAbsence::firstOrCreate([
            'member_id' => $validated['member_id'],
            'training_schedule_id' => $validated['training_schedule_id'],
            'date' => $validated['date'],
        ], [
            'reason' => $validated['reason'] ?? null,
        ]);

        return response()->json(['success' => true, 'absence' => $absence]);
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'member_id' => 'required|integer',
            'training_schedule_id' => 'required|exists:training_schedules,id',
            'date' => 'required|date',
        ]);

        $userMemberIds = $request->user()->members()->pluck('members.id');
        if (! $userMemberIds->contains($validated['member_id'])) {
            abort(403, 'Je hebt geen toegang tot dit lid.');
        }

        TrainingAbsence::where([
            'member_id' => $validated['member_id'],
            'training_schedule_id' => $validated['training_schedule_id'],
            'date' => $validated['date'],
        ])->delete();

        return response()->json(['success' => true]);
    }
}
