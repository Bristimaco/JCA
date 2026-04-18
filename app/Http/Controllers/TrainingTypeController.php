<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\TrainingType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TrainingTypeController extends Controller
{
    public function store(Request $request, Member $member): RedirectResponse
    {
        $this->authorizeMember($request, $member);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'surplus_calories' => ['required', 'numeric', 'min:0', 'max:99999'],
            'surplus_protein' => ['nullable', 'numeric', 'min:0', 'max:99999'],
            'surplus_carbohydrates' => ['nullable', 'numeric', 'min:0', 'max:99999'],
            'surplus_fats' => ['nullable', 'numeric', 'min:0', 'max:99999'],
        ]);

        $exists = $member->trainingTypes()->where('name', $validated['name'])->exists();

        if ($exists) {
            return back()->withErrors(['name' => 'Dit trainingstype bestaat al.']);
        }

        $member->trainingTypes()->create($validated);

        return back()->with('status', "Trainingstype '{$validated['name']}' toegevoegd.");
    }

    public function update(Request $request, Member $member, TrainingType $trainingType): RedirectResponse
    {
        $this->authorizeMember($request, $member);

        if ($trainingType->member_id !== $member->id) {
            abort(403);
        }

        $validated = $request->validate([
            'surplus_calories' => ['required', 'numeric', 'min:0', 'max:99999'],
            'surplus_protein' => ['nullable', 'numeric', 'min:0', 'max:99999'],
            'surplus_carbohydrates' => ['nullable', 'numeric', 'min:0', 'max:99999'],
            'surplus_fats' => ['nullable', 'numeric', 'min:0', 'max:99999'],
        ]);

        $trainingType->update($validated);

        return back()->with('status', "Trainingstype '{$trainingType->name}' bijgewerkt.");
    }

    public function destroy(Request $request, Member $member, TrainingType $trainingType): RedirectResponse
    {
        $this->authorizeMember($request, $member);

        if ($trainingType->member_id !== $member->id) {
            abort(403);
        }

        if ($trainingType->is_default) {
            return back()->with('status', 'Het standaard trainingstype kan niet worden verwijderd.');
        }

        $name = $trainingType->name;
        $trainingType->delete();

        return back()->with('status', "Trainingstype '{$name}' verwijderd.");
    }

    private function authorizeMember(Request $request, Member $member): void
    {
        if (! $request->user()->members()->where('members.id', $member->id)->exists()) {
            abort(403);
        }
    }
}
