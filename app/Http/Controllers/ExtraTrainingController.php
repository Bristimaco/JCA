<?php

namespace App\Http\Controllers;

use App\Models\TrainingGroup;
use App\Models\TrainingSchedule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExtraTrainingController extends Controller
{
    public function create(Request $request): Response
    {
        $groups = TrainingGroup::orderBy('name')->get(['id', 'name']);

        $trainers = User::where('role', 'coach')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('ExtraTraining/Create', [
            'groups' => $groups,
            'trainers' => $trainers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time'],
            'trainer_id' => ['nullable', 'exists:users,id'],
            'training_group_ids' => ['required', 'array', 'min:1'],
            'training_group_ids.*' => ['exists:training_groups,id'],
        ]);

        $schedule = TrainingSchedule::create([
            'is_extra' => true,
            'name' => $request->input('name'),
            'date' => $request->input('date'),
            'start_time' => $request->input('start_time'),
            'end_time' => $request->input('end_time'),
            'trainer_id' => $request->input('trainer_id'),
            'day' => null,
            'training_group_id' => null,
        ]);

        $schedule->trainingGroups()->sync($request->input('training_group_ids'));

        return redirect()->route('dashboard')->with('status', 'Extra training aangemaakt.');
    }

    public function destroy(TrainingSchedule $schedule): RedirectResponse
    {
        if (! $schedule->is_extra) {
            abort(403);
        }

        $schedule->delete();

        return back()->with('status', 'Extra training verwijderd.');
    }
}
