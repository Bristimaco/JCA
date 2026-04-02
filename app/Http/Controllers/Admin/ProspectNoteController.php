<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prospect;
use App\Models\ProspectNote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProspectNoteController extends Controller
{
    public function store(Request $request, Prospect $prospect): RedirectResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
        ]);

        $prospect->notes()->create([
            'content' => $validated['content'],
            'created_by' => $request->user()->id,
        ]);

        return back()->with('status', 'Notitie toegevoegd.');
    }

    public function destroy(Prospect $prospect, ProspectNote $note): RedirectResponse
    {
        abort_unless($note->prospect_id === $prospect->id, 404);

        $note->delete();

        return back()->with('status', 'Notitie verwijderd.');
    }
}
