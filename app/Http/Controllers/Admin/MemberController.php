<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MemberController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'string', 'in:male,female'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'license_number' => ['nullable', 'string', 'max:255', 'unique:members,license_number'],
            'weight_category_id' => ['nullable', 'integer', 'exists:weight_categories,id'],
            'membership_status' => ['required', 'string', 'in:active,inactive,suspended,pending'],
            'is_competition' => ['boolean'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('member-photos', 'public');
        }

        unset($validated['photo']);

        Member::create($validated);

        return back()->with('status', "Lid {$validated['first_name']} {$validated['last_name']} is aangemaakt.");
    }

    public function update(Request $request, Member $member): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'string', 'in:male,female'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'license_number' => ['nullable', 'string', 'max:255', 'unique:members,license_number,'.$member->id],
            'weight_category_id' => ['nullable', 'integer', 'exists:weight_categories,id'],
            'membership_status' => ['required', 'string', 'in:active,inactive,suspended,pending'],
            'is_competition' => ['boolean'],
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

    public function destroy(Member $member): RedirectResponse
    {
        $name = $member->fullName();

        if ($member->photo_path) {
            Storage::disk('public')->delete($member->photo_path);
        }

        $member->delete();

        return back()->with('status', "Lid {$name} is verwijderd.");
    }
}
