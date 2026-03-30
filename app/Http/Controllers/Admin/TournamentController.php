<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TournamentStatus;
use App\Http\Controllers\Controller;
use App\Models\Tournament;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

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
            'invitation_deadline' => ['required', 'date', 'before:registration_deadline'],
            'registration_deadline' => ['required', 'date', 'before:tournament_date'],
            'age_category_ids' => ['required', 'array', 'min:1'],
            'age_category_ids.*' => ['integer', 'exists:age_categories,id'],
            'age_category_fees' => ['nullable', 'array'],
            'age_category_fees.*' => ['nullable', 'numeric', 'min:0'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],
        ]);

        $ageCategoryIds = $validated['age_category_ids'] ?? [];
        $ageCategoryFees = $validated['age_category_fees'] ?? [];
        $attachments = $request->file('attachments', []);
        unset($validated['age_category_ids'], $validated['age_category_fees'], $validated['attachments']);

        $tournament = Tournament::create($validated);

        $syncData = [];
        foreach ($ageCategoryIds as $id) {
            $syncData[$id] = ['entry_fee' => $ageCategoryFees[$id] ?? null];
        }
        $tournament->ageCategories()->sync($syncData);

        foreach ($attachments as $file) {
            $tournament->attachments()->create([
                'file_data' => base64_encode(file_get_contents($file->getRealPath())),
                'mime_type' => $file->getMimeType(),
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
            'invitation_deadline' => ['required', 'date', 'before:registration_deadline'],
            'registration_deadline' => ['required', 'date', 'before:tournament_date'],
            'age_category_ids' => ['required', 'array', 'min:1'],
            'age_category_ids.*' => ['integer', 'exists:age_categories,id'],
            'age_category_fees' => ['nullable', 'array'],
            'age_category_fees.*' => ['nullable', 'numeric', 'min:0'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],
            'remove_attachment_ids' => ['nullable', 'array'],
            'remove_attachment_ids.*' => ['integer', 'exists:tournament_attachments,id'],
        ]);

        $ageCategoryIds = $validated['age_category_ids'] ?? [];
        $ageCategoryFees = $validated['age_category_fees'] ?? [];
        $attachments = $request->file('attachments', []);
        $removeAttachmentIds = $validated['remove_attachment_ids'] ?? [];
        unset($validated['age_category_ids'], $validated['age_category_fees'], $validated['attachments'], $validated['remove_attachment_ids']);

        $tournament->update($validated);

        $syncData = [];
        foreach ($ageCategoryIds as $id) {
            $syncData[$id] = ['entry_fee' => $ageCategoryFees[$id] ?? null];
        }
        $tournament->ageCategories()->sync($syncData);

        // Remove attachments
        if ($removeAttachmentIds) {
            $tournament->attachments()->whereIn('id', $removeAttachmentIds)->delete();
        }

        // Add new attachments
        foreach ($attachments as $file) {
            $tournament->attachments()->create([
                'file_data' => base64_encode(file_get_contents($file->getRealPath())),
                'mime_type' => $file->getMimeType(),
                'original_name' => $file->getClientOriginalName(),
            ]);
        }

        return back()->with('status', "Toernooi \"{$tournament->name}\" is bijgewerkt.");
    }

    public function destroy(Tournament $tournament): RedirectResponse
    {
        $name = $tournament->name;

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
