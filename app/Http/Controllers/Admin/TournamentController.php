<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TournamentStatus;
use App\Http\Controllers\Controller;
use App\Models\Tournament;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TournamentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'country_code' => ['required', 'string', 'size:2'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'tournament_date' => ['required', 'date'],
            'invitation_deadline' => ['nullable', 'date'],
            'registration_deadline' => ['nullable', 'date'],
            'age_category_ids' => ['nullable', 'array'],
            'age_category_ids.*' => ['integer', 'exists:age_categories,id'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],
        ]);

        $ageCategoryIds = $validated['age_category_ids'] ?? [];
        $attachments = $request->file('attachments', []);
        unset($validated['age_category_ids'], $validated['attachments']);

        $tournament = Tournament::create($validated);
        $tournament->ageCategories()->sync($ageCategoryIds);

        foreach ($attachments as $file) {
            $tournament->attachments()->create([
                'file_path' => $file->store('tournament-attachments', 'public'),
                'original_name' => $file->getClientOriginalName(),
            ]);
        }

        return back()->with('status', "Toernooi \"{$tournament->name}\" is aangemaakt.");
    }

    public function update(Request $request, Tournament $tournament): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'country_code' => ['required', 'string', 'size:2'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'tournament_date' => ['required', 'date'],
            'invitation_deadline' => ['nullable', 'date'],
            'registration_deadline' => ['nullable', 'date'],
            'age_category_ids' => ['nullable', 'array'],
            'age_category_ids.*' => ['integer', 'exists:age_categories,id'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],
            'remove_attachment_ids' => ['nullable', 'array'],
            'remove_attachment_ids.*' => ['integer', 'exists:tournament_attachments,id'],
        ]);

        $ageCategoryIds = $validated['age_category_ids'] ?? [];
        $attachments = $request->file('attachments', []);
        $removeAttachmentIds = $validated['remove_attachment_ids'] ?? [];
        unset($validated['age_category_ids'], $validated['attachments'], $validated['remove_attachment_ids']);

        $tournament->update($validated);
        $tournament->ageCategories()->sync($ageCategoryIds);

        // Remove attachments
        if ($removeAttachmentIds) {
            $toRemove = $tournament->attachments()->whereIn('id', $removeAttachmentIds)->get();
            foreach ($toRemove as $attachment) {
                Storage::disk('public')->delete($attachment->file_path);
                $attachment->delete();
            }
        }

        // Add new attachments
        foreach ($attachments as $file) {
            $tournament->attachments()->create([
                'file_path' => $file->store('tournament-attachments', 'public'),
                'original_name' => $file->getClientOriginalName(),
            ]);
        }

        return back()->with('status', "Toernooi \"{$tournament->name}\" is bijgewerkt.");
    }

    public function destroy(Tournament $tournament): RedirectResponse
    {
        $name = $tournament->name;

        foreach ($tournament->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $tournament->delete();

        return back()->with('status', "Toernooi \"{$name}\" is verwijderd.");
    }

    public function archive(Tournament $tournament): RedirectResponse
    {
        if ($tournament->status !== TournamentStatus::Finished) {
            return back()->with('status', 'Alleen afgelopen toernooien kunnen worden gearchiveerd.');
        }

        $tournament->update(['status' => TournamentStatus::Archived]);

        return back()->with('status', "Toernooi \"{$tournament->name}\" is gearchiveerd.");
    }
}
