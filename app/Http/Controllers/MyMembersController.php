<?php

namespace App\Http\Controllers;

use App\Models\AgeCategory;
use App\Models\Member;
use App\Models\TrainingAttendance;
use App\Models\WeightCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyMembersController extends Controller
{
    public function index(Request $request): Response
    {
        $members = $request->user()->members()->with(['weightCategory', 'tournamentResults.tournament'])->orderBy('first_name')->get()
            ->map(function (Member $m) {
                $attendanceQuery = TrainingAttendance::where('member_id', $m->id)
                    ->whereHas('trainingSession', fn ($q) => $q->whereNotNull('closed_at'));
                $attendanceCount = $attendanceQuery->count();
                $attendanceHistory = $attendanceQuery
                    ->with(['trainingSession.trainingSchedule.trainingGroup'])
                    ->latest('confirmed_at')
                    ->get()
                    ->map(fn ($a) => [
                        'date' => $a->trainingSession->date->toDateString(),
                        'group_name' => $a->trainingSession->trainingSchedule->trainingGroup->name,
                        'day' => $a->trainingSession->trainingSchedule->day,
                    ]);

                return [
                    ...$m->toArray(),
                    'photo_url' => $m->photo_data ? route('member-photo', $m) : null,
                    'weight_category_name' => $m->weightCategory?->name,
                    'current_belt' => $m->currentBelt()?->value,
                    'current_belt_label' => $m->currentBelt()?->label(),
                    'tournament_results' => $m->is_competition ? $m->tournamentResults->sortByDesc(fn ($r) => $r->tournament->tournament_date)->map(fn ($r) => [
                        'id' => $r->id,
                        'tournament_name' => $r->tournament->name,
                        'tournament_date' => $r->tournament->tournament_date->toDateString(),
                        'result' => $r->result,
                        'notes' => $r->notes,
                    ])->values()->all() : [],
                    'attendance_count' => $attendanceCount,
                    'attendance_history' => $attendanceHistory,
                ];
            });

        $ageCategories = AgeCategory::ordered()->get();
        $weightCategories = WeightCategory::ordered()->get();

        return Inertia::render('MyMembers', [
            'members' => $members,
            'ageCategories' => $ageCategories,
            'weightCategories' => $weightCategories,
        ]);
    }

    public function update(Request $request, Member $member): RedirectResponse
    {
        if (! $member->users()->where('users.id', $request->user()->id)->exists()) {
            abort(403);
        }

        $validated = $request->validate([
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'weight_category_id' => ['nullable', 'integer', 'exists:weight_categories,id'],
            'photo' => ['nullable', 'string'],
        ]);

        if (! empty($validated['photo']) && str_starts_with($validated['photo'], 'data:image/')) {
            [$meta, $base64] = explode(',', $validated['photo'], 2);
            preg_match('#data:(image/[a-z+]+);#', $meta, $m);
            $validated['photo_mime'] = $m[1] ?? 'image/jpeg';
            $validated['photo_data'] = $base64;
        }

        unset($validated['photo']);

        $member->update($validated);

        return back()->with('status', "{$member->fullName()} is bijgewerkt.");
    }
}
