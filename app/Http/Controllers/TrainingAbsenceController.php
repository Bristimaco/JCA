<?php

namespace App\Http\Controllers;

use App\Models\TrainingAbsence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrainingAbsenceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'training_schedule_id' => 'required|exists:training_schedules,id',
            'date' => 'required|date',
            'reason' => 'nullable|string|max:255',
        ]);

        $memberId = Auth::user()->member->id ?? null;
        if (! $memberId) {
            abort(403, 'Alleen leden kunnen afwezigheid melden.');
        }

        $absence = TrainingAbsence::firstOrCreate([
            'member_id' => $memberId,
            'training_schedule_id' => $validated['training_schedule_id'],
            'date' => $validated['date'],
        ], [
            'reason' => $validated['reason'] ?? null,
        ]);

        // TODO: Notify trainer(s) here

        return response()->json(['success' => true, 'absence' => $absence]);
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'training_schedule_id' => 'required|exists:training_schedules,id',
            'date' => 'required|date',
        ]);

        $memberId = Auth::user()->member->id ?? null;
        if (! $memberId) {
            abort(403, 'Alleen leden kunnen afwezigheid melden.');
        }

        TrainingAbsence::where([
            'member_id' => $memberId,
            'training_schedule_id' => $validated['training_schedule_id'],
            'date' => $validated['date'],
        ])->delete();

        return response()->json(['success' => true]);
    }
}
