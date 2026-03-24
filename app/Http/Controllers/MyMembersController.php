<?php

namespace App\Http\Controllers;

use App\Models\AgeCategory;
use App\Models\Member;
use App\Models\WeightCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MyMembersController extends Controller
{
    public function index(Request $request): Response
    {
        $members = $request->user()->members()->with(['weightCategory', 'tournamentResults.tournament'])->orderBy('first_name')->get()
            ->map(fn (Member $m) => [
                ...$m->toArray(),
                'photo_url' => $m->photo_path ? asset('storage/'.$m->photo_path) : null,
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
            ]);

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
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('photo')) {
            if ($member->photo_path) {
                Storage::disk('public')->delete($member->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('member-photos', 'public');
        }

        unset($validated['photo']);

        $member->update($validated);

        return back()->with('status', "{$member->fullName()} is bijgewerkt.");
    }
}
