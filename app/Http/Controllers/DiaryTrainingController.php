<?php

namespace App\Http\Controllers;

use App\Models\DiaryTraining;
use App\Models\Member;
use App\Models\TrainingAbsence;
use App\Models\TrainingCancellation;
use App\Models\TrainingSchedule;
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

            if ($trainingType->is_default && $this->hasScheduledTrainingToday($member)) {
                $member->autoTrainingDismissals()->firstOrCreate([
                    'training_type_id' => $trainingType->id,
                    'date' => $today,
                ]);
            }

            return back()->with('status', "Training '{$trainingType->name}' verwijderd voor vandaag.");
        }

        $member->diaryTrainings()->create([
            'training_type_id' => $trainingType->id,
            'date' => $today,
        ]);

        $member->autoTrainingDismissals()
            ->where('training_type_id', $trainingType->id)
            ->whereDate('date', $today)
            ->delete();

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

    private function hasScheduledTrainingToday(Member $member): bool
    {
        $today = Carbon::today()->toDateString();
        $todayDay = ucfirst(now()->locale('nl')->isoFormat('dddd'));
        $groupIds = $member->trainingGroups()->pluck('training_groups.id');

        if ($groupIds->isEmpty()) {
            return false;
        }

        $scheduleIds = TrainingSchedule::where(function ($q) use ($groupIds, $todayDay) {
            $q->where('is_extra', false)
                ->whereIn('training_group_id', $groupIds)
                ->where('day', $todayDay);
        })->orWhere(function ($q) use ($groupIds, $today) {
            $q->where('is_extra', true)
                ->whereDate('date', $today)
                ->where(function ($q2) use ($groupIds) {
                    $q2->whereIn('training_group_id', $groupIds)
                        ->orWhereHas('trainingGroups', fn ($q3) => $q3->whereIn('training_groups.id', $groupIds));
                });
        })->pluck('id');

        if ($scheduleIds->isEmpty()) {
            return false;
        }

        $cancelledIds = TrainingCancellation::whereIn('training_schedule_id', $scheduleIds)
            ->whereDate('date', $today)
            ->pluck('training_schedule_id');

        $activeScheduleIds = $scheduleIds->diff($cancelledIds);

        if ($activeScheduleIds->isEmpty()) {
            return false;
        }

        $absentScheduleIds = TrainingAbsence::where('member_id', $member->id)
            ->whereIn('training_schedule_id', $activeScheduleIds)
            ->whereDate('date', $today)
            ->pluck('training_schedule_id');

        return $activeScheduleIds->diff($absentScheduleIds)->isNotEmpty();
    }
}
