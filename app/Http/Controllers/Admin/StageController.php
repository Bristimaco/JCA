<?php

namespace App\Http\Controllers\Admin;

use App\Enums\StageStatus;
use App\Http\Controllers\Controller;
use App\Models\Stage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StageController extends Controller
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
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'invitation_deadline' => ['required', 'date', 'before:registration_deadline'],
            'registration_deadline' => ['required', 'date', 'before:start_date'],
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

        $stage = Stage::create($validated);

        $syncData = [];
        foreach ($ageCategoryIds as $id) {
            $syncData[$id] = ['entry_fee' => $ageCategoryFees[$id] ?? null];
        }
        $stage->ageCategories()->sync($syncData);

        foreach ($attachments as $file) {
            $stage->attachments()->create([
                'file_data' => base64_encode(file_get_contents($file->getRealPath())),
                'mime_type' => $file->getMimeType(),
                'original_name' => $file->getClientOriginalName(),
            ]);
        }

        return back()->with('status', "Stage \"{$stage->name}\" is aangemaakt.");
    }

    public function update(Request $request, Stage $stage): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'country_code' => ['required', 'string', 'size:2'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'invitation_deadline' => ['required', 'date', 'before:registration_deadline'],
            'registration_deadline' => ['required', 'date', 'before:start_date'],
            'age_category_ids' => ['required', 'array', 'min:1'],
            'age_category_ids.*' => ['integer', 'exists:age_categories,id'],
            'age_category_fees' => ['nullable', 'array'],
            'age_category_fees.*' => ['nullable', 'numeric', 'min:0'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240'],
            'remove_attachment_ids' => ['nullable', 'array'],
            'remove_attachment_ids.*' => ['integer', 'exists:stage_attachments,id'],
        ]);

        $ageCategoryIds = $validated['age_category_ids'] ?? [];
        $ageCategoryFees = $validated['age_category_fees'] ?? [];
        $attachments = $request->file('attachments', []);
        $removeAttachmentIds = $validated['remove_attachment_ids'] ?? [];
        unset($validated['age_category_ids'], $validated['age_category_fees'], $validated['attachments'], $validated['remove_attachment_ids']);

        $stage->update($validated);

        $syncData = [];
        foreach ($ageCategoryIds as $id) {
            $syncData[$id] = ['entry_fee' => $ageCategoryFees[$id] ?? null];
        }
        $stage->ageCategories()->sync($syncData);

        if ($removeAttachmentIds) {
            $stage->attachments()->whereIn('id', $removeAttachmentIds)->delete();
        }

        foreach ($attachments as $file) {
            $stage->attachments()->create([
                'file_data' => base64_encode(file_get_contents($file->getRealPath())),
                'mime_type' => $file->getMimeType(),
                'original_name' => $file->getClientOriginalName(),
            ]);
        }

        return back()->with('status', "Stage \"{$stage->name}\" is bijgewerkt.");
    }

    public function destroy(Stage $stage): RedirectResponse
    {
        $name = $stage->name;

        $stage->delete();

        return back()->with('status', "Stage \"{$name}\" is verwijderd.");
    }

    public function archive(Stage $stage): RedirectResponse
    {
        if ($stage->status !== StageStatus::RegistrationsClosed) {
            return back()->with('status', 'Alleen voltooide stages kunnen worden gearchiveerd.');
        }

        $stage->update(['status' => StageStatus::Archived]);

        return back()->with('status', "Stage \"{$stage->name}\" is gearchiveerd.");
    }
}
