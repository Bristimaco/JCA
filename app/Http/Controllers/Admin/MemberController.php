<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BeltRank;
use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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
            'is_trainer' => ['boolean'],
            'photo' => ['nullable', 'string'],
            'belt_rank' => ['nullable', 'string', Rule::in(array_column(BeltRank::cases(), 'value'))],
            'membership_renewal_date' => ['required', 'date'],
        ]);

        if (!empty($validated['photo']) && str_starts_with($validated['photo'], 'data:image/')) {
            [$meta, $base64] = explode(',', $validated['photo'], 2);
            preg_match('#data:(image/[a-z+]+);#', $meta, $m);
            $validated['photo_mime'] = $m[1] ?? 'image/jpeg';
            $validated['photo_data'] = $base64;
        }

        $beltRank = $validated['belt_rank'] ?? null;
        unset($validated['photo'], $validated['belt_rank']);

        $member = Member::create($validated);

        if ($beltRank) {
            $member->beltHistories()->create([
                'belt_rank' => $beltRank,
                'achieved_date' => now()->toDateString(),
            ]);
        }

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
            'license_number' => ['nullable', 'string', 'max:255', 'unique:members,license_number,' . $member->id],
            'weight_category_id' => ['nullable', 'integer', 'exists:weight_categories,id'],
            'membership_status' => ['required', 'string', 'in:active,inactive,suspended,pending'],
            'is_competition' => ['boolean'],
            'is_trainer' => ['boolean'],
            'photo' => ['nullable', 'string'],
            'belt_rank' => ['nullable', 'string', Rule::in(array_column(BeltRank::cases(), 'value'))],
            'membership_renewal_date' => ['required', 'date'],
        ]);

        if (!empty($validated['photo']) && str_starts_with($validated['photo'], 'data:image/')) {
            [$meta, $base64] = explode(',', $validated['photo'], 2);
            preg_match('#data:(image/[a-z+]+);#', $meta, $m);
            $validated['photo_mime'] = $m[1] ?? 'image/jpeg';
            $validated['photo_data'] = $base64;
        }

        $beltRank = $validated['belt_rank'] ?? null;
        unset($validated['photo'], $validated['belt_rank']);

        $member->update($validated);

        if ($beltRank && $beltRank !== $member->currentBelt()?->value) {
            $member->beltHistories()->create([
                'belt_rank' => $beltRank,
                'achieved_date' => now()->toDateString(),
            ]);
        }

        return back()->with('status', "{$member->fullName()} is bijgewerkt.");
    }

    public function markAsPaid(Member $member): RedirectResponse
    {
        $member->update([
            'membership_renewal_date' => $member->membership_renewal_date->addYear(),
            'membership_fee_reminded_at' => null,
        ]);

        return back()->with('status', "Lidgeld voor {$member->fullName()} is geregistreerd als betaald. Vernieuwingsdatum: {$member->membership_renewal_date->format('d/m/Y')}.");
    }

    public function destroy(Member $member): RedirectResponse
    {
        $name = $member->fullName();

        $member->delete();

        return back()->with('status', "Lid {$name} is verwijderd.");
    }
}
