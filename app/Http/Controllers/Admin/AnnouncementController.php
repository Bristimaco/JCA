<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'photo' => ['nullable', 'string'],
        ]);

        $data = [
            'title' => $validated['title'],
            'content' => $validated['content'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'display_order' => $validated['display_order'] ?? 0,
        ];

        if (! empty($validated['photo'])) {
            $this->applyPhoto($data, $validated['photo']);
        }

        Announcement::create($data);

        return back()->with('status', "Mededeling '{$validated['title']}' aangemaakt.");
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'photo' => ['nullable', 'string'],
            'remove_photo' => ['nullable', 'boolean'],
        ]);

        $data = [
            'title' => $validated['title'],
            'content' => $validated['content'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'display_order' => $validated['display_order'] ?? 0,
        ];

        if (! empty($validated['remove_photo'])) {
            $data['photo_data'] = null;
            $data['photo_mime'] = null;
        } elseif (! empty($validated['photo'])) {
            $this->applyPhoto($data, $validated['photo']);
        }

        $announcement->update($data);

        return back()->with('status', "Mededeling '{$announcement->title}' bijgewerkt.");
    }

    public function archive(Announcement $announcement): RedirectResponse
    {
        $announcement->update(['is_archived' => ! $announcement->is_archived]);

        $label = $announcement->is_archived ? 'gearchiveerd' : 'geactiveerd';

        return back()->with('status', "Mededeling '{$announcement->title}' {$label}.");
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $name = $announcement->title;
        $announcement->delete();

        return back()->with('status', "Mededeling '{$name}' verwijderd.");
    }

    private function applyPhoto(array &$data, string $dataUrl): void
    {
        if (preg_match('/^data:(image\/[a-zA-Z+]+);base64,(.+)$/', $dataUrl, $matches)) {
            $data['photo_mime'] = $matches[1];
            $data['photo_data'] = $matches[2];
        }
    }
}
