<?php

namespace App\Http\Controllers;

use App\Models\DiaryTraining;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DiaryTrainingController extends Controller
{
    public function toggle(Request $request, Member $member): RedirectResponse
    {
        $this->authorizeMember($request, $member);

        $request->validate([
            'training_type_id' => ['required', 'exists:training_types,id'],
        ]);

        $trainingType = $member->trainingTypes()->findOrFail($request->input('training_type_id'));
        $today = Carbon::today()->toDateString();

        $existing = $member->diaryTrainings()
            ->where('training_type_id', $trainingType->id)
            ->whereDate('date', $today)
            ->first();

        if ($existing) {
            $existing->delete();

            return back()->with('status', "Training '{$trainingType->name}' verwijderd voor vandaag.");
        }

        $member->diaryTrainings()->create([
            'training_type_id' => $trainingType->id,
            'date' => $today,
        ]);

        return back()->with('status', "Training '{$trainingType->name}' toegevoegd voor vandaag.");
    }

    public function updateActualCalories(Request $request, DiaryTraining $diaryTraining): RedirectResponse
    {
        $this->authorizeMember($request, $diaryTraining->member);

        $request->validate([
            'actual_calories' => ['nullable', 'numeric', 'min:0', 'max:99999'],
        ]);

        $diaryTraining->update([
            'actual_calories' => $request->input('actual_calories'),
        ]);

        return back()->with('status', 'Werkelijke calorieën bijgewerkt.');
    }

    private function authorizeMember(Request $request, Member $member): void
    {
        if (! $request->user()->members()->where('members.id', $member->id)->exists()) {
            abort(403);
        }
    }
}
