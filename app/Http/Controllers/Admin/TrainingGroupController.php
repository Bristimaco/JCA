<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TrainingGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TrainingGroupController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'membership_fee' => ['required', 'numeric', 'min:0'],
            'membership_fee_discount' => ['nullable', 'numeric', 'min:0'],
            'training_day' => ['nullable', 'string', 'max:255'],
            'training_time' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'trainer_id' => ['nullable', 'exists:users,id'],
        ]);

        $validated['membership_fee_discount'] = $validated['membership_fee_discount'] ?? 0;

        TrainingGroup::create($validated);

        return back();
    }

    public function update(Request $request, TrainingGroup $trainingGroup): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'membership_fee' => ['required', 'numeric', 'min:0'],
            'membership_fee_discount' => ['nullable', 'numeric', 'min:0'],
            'training_day' => ['nullable', 'string', 'max:255'],
            'training_time' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'trainer_id' => ['nullable', 'exists:users,id'],
        ]);

        $validated['membership_fee_discount'] = $validated['membership_fee_discount'] ?? 0;

        $trainingGroup->update($validated);

        return back();
    }

    public function destroy(TrainingGroup $trainingGroup): RedirectResponse
    {
        $trainingGroup->delete();

        return back();
    }
}
