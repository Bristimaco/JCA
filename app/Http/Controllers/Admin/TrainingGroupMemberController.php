<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TrainingGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TrainingGroupMemberController extends Controller
{
    public function update(Request $request, TrainingGroup $trainingGroup): RedirectResponse
    {
        $validated = $request->validate([
            'member_ids' => ['present', 'array'],
            'member_ids.*' => ['integer', 'exists:members,id'],
        ]);

        $trainingGroup->members()->sync($validated['member_ids']);

        return back();
    }
}
