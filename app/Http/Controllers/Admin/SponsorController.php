<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SponsorTier;
use App\Http\Controllers\Controller;
use App\Models\Sponsor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SponsorController extends Controller
{
    public function index(): Response
    {
        $sponsors = Sponsor::orderBy('name')
            ->get(['id', 'name', 'address_street', 'address_city', 'address_postal_code', 'contact_name', 'contact_phone', 'tier', 'contract_start_date', 'contract_end_date', 'is_active', 'logo_mime', 'sponsor_amount', 'renewal_months', 'created_at'])
            ->map(fn (Sponsor $s) => [
                ...$s->toArray(),
                'has_logo' => (bool) $s->logo_mime,
            ]);

        return Inertia::render('Admin/Sponsors', [
            'sponsors' => $sponsors,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'tier' => ['required', Rule::enum(SponsorTier::class)],
            'contract_start_date' => ['required', 'date'],
            'contract_end_date' => ['required', 'date', 'after_or_equal:contract_start_date'],
            'sponsor_amount' => ['nullable', 'numeric', 'min:0'],
            'renewal_months' => ['nullable', 'integer', 'in:6,12,24,36'],
            'logo' => ['nullable', 'string'],
        ]);

        $data = [
            'name' => $validated['name'],
            'address_street' => $validated['address_street'] ?? null,
            'address_city' => $validated['address_city'] ?? null,
            'address_postal_code' => $validated['address_postal_code'] ?? null,
            'contact_name' => $validated['contact_name'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'tier' => $validated['tier'],
            'contract_start_date' => $validated['contract_start_date'],
            'contract_end_date' => $validated['contract_end_date'],
            'sponsor_amount' => $validated['sponsor_amount'] ?? null,
            'renewal_months' => $validated['renewal_months'] ?? null,
        ];

        if (! empty($validated['logo'])) {
            $this->applyLogo($data, $validated['logo']);
        }

        Sponsor::create($data);

        return back()->with('status', "Sponsor '{$validated['name']}' aangemaakt.");
    }

    public function update(Request $request, Sponsor $sponsor): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'tier' => ['required', Rule::enum(SponsorTier::class)],
            'contract_start_date' => ['required', 'date'],
            'contract_end_date' => ['required', 'date', 'after_or_equal:contract_start_date'],
            'sponsor_amount' => ['nullable', 'numeric', 'min:0'],
            'renewal_months' => ['nullable', 'integer', 'in:6,12,24,36'],
            'logo' => ['nullable', 'string'],
            'remove_logo' => ['nullable', 'boolean'],
        ]);

        $data = [
            'name' => $validated['name'],
            'address_street' => $validated['address_street'] ?? null,
            'address_city' => $validated['address_city'] ?? null,
            'address_postal_code' => $validated['address_postal_code'] ?? null,
            'contact_name' => $validated['contact_name'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'tier' => $validated['tier'],
            'contract_start_date' => $validated['contract_start_date'],
            'contract_end_date' => $validated['contract_end_date'],
            'sponsor_amount' => $validated['sponsor_amount'] ?? null,
            'renewal_months' => $validated['renewal_months'] ?? null,
        ];

        if (! empty($validated['remove_logo'])) {
            $data['logo_data'] = null;
            $data['logo_mime'] = null;
        } elseif (! empty($validated['logo'])) {
            $this->applyLogo($data, $validated['logo']);
        }

        $sponsor->update($data);

        return back()->with('status', "Sponsor '{$sponsor->name}' bijgewerkt.");
    }

    public function renew(Sponsor $sponsor): RedirectResponse
    {
        $sponsor->renew();

        return back()->with('status', "Contract van '{$sponsor->name}' verlengd tot {$sponsor->contract_end_date->format('d/m/Y')}.");
    }

    public function destroy(Sponsor $sponsor): RedirectResponse
    {
        $name = $sponsor->name;
        $sponsor->delete();

        return back()->with('status', "Sponsor '{$name}' verwijderd.");
    }

    private function applyLogo(array &$data, string $dataUrl): void
    {
        if (preg_match('/^data:(image\/[a-zA-Z+]+);base64,(.+)$/', $dataUrl, $matches)) {
            $data['logo_mime'] = $matches[1];
            $data['logo_data'] = $matches[2];
        }
    }
}
