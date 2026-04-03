<?php

namespace App\Http\Controllers;

use App\Models\TrainingCancellation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TrainingCancellationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'training_schedule_id' => ['required', 'exists:training_schedules,id'],
            'date' => ['required', 'date'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        TrainingCancellation::updateOrCreate(
            [
                'training_schedule_id' => $validated['training_schedule_id'],
                'date' => $validated['date'],
            ],
            [
                'reason' => $validated['reason'] ?? null,
            ]
        );

        return back();
    }

    public function destroy(TrainingCancellation $trainingCancellation): RedirectResponse
    {
        $trainingCancellation->delete();

        return back();
    }
}
