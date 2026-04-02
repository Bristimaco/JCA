<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\TrainingGroup;
use App\Models\TrainingSchedule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ExtraTrainingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $isAdmin = $user->role === UserRole::ADMIN;

        $query = TrainingSchedule::where('is_extra', true)
            ->with(['trainingGroups:id,name', 'trainer:id,name']);

        if (! $isAdmin) {
            $query->where('trainer_id', $user->id);
        }

        $extraTrainings = $query->orderByDesc('date')->get();

        $groups = TrainingGroup::orderBy('name')->get(['id', 'name']);

        $trainers = User::where('role', 'coach')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('ExtraTraining/Index', [
            'extraTrainings' => $extraTrainings,
            'groups' => $groups,
            'trainers' => $trainers,
            'isAdmin' => $isAdmin,
        ]);
    }

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
            'trainer_id' => $request->input('trainer_id') ?: Auth::id(),
            'day' => null,
            'training_group_id' => null,
        ]);

        $schedule->trainingGroups()->sync($request->input('training_group_ids'));

        $isAdmin = str_contains($request->path(), 'admin');
        $prefix = $isAdmin ? '/admin' : '/trainer';

        return redirect($prefix.'/extra-training')->with('status', 'Extra training aangemaakt.');
    }

    public function update(Request $request, TrainingSchedule $schedule): RedirectResponse
    {
        if (! $schedule->is_extra) {
            abort(403);
        }

        if ($schedule->date && $schedule->date->lt(today())) {
            abort(403, 'Verlopen trainingen kunnen niet worden bewerkt.');
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i', 'after:start_time'],
            'trainer_id' => ['nullable', 'exists:users,id'],
            'training_group_ids' => ['required', 'array', 'min:1'],
            'training_group_ids.*' => ['exists:training_groups,id'],
        ]);

        $schedule->update([
            'name' => $request->input('name'),
            'date' => $request->input('date'),
            'start_time' => $request->input('start_time'),
            'end_time' => $request->input('end_time'),
            'trainer_id' => $request->input('trainer_id'),
        ]);

        $schedule->trainingGroups()->sync($request->input('training_group_ids'));

        return back()->with('status', 'Extra training bijgewerkt.');
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
