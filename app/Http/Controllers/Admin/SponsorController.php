<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SponsorTier;
use App\Http\Controllers\Controller;
use App\Models\Sponsor;
use App\Services\CbeApiService;
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
                'logo_url' => $s->logo_mime ? '/sponsor-logo/'.$s->id : null,
            ]);

        return Inertia::render('Admin/Sponsors', [
            'sponsors' => $sponsors,
        ]);
    }

    public function show(Sponsor $sponsor): Response
    {
        return Inertia::render('Admin/SponsorDetail', [
            'sponsor' => [
                'id' => $sponsor->id,
                'name' => $sponsor->name,
                'vat_number' => $sponsor->vat_number,
                'address_street' => $sponsor->address_street,
                'address_city' => $sponsor->address_city,
                'address_postal_code' => $sponsor->address_postal_code,
                'legal_form' => $sponsor->legal_form,
                'phone' => $sponsor->phone,
                'email' => $sponsor->email,
                'website' => $sponsor->website,
                'contact_name' => $sponsor->contact_name,
                'contact_phone' => $sponsor->contact_phone,
                'latitude' => $sponsor->latitude,
                'longitude' => $sponsor->longitude,
                'tier' => $sponsor->tier?->value ?? 'bronze',
                'contract_start_date' => $sponsor->contract_start_date?->toDateString(),
                'contract_end_date' => $sponsor->contract_end_date?->toDateString(),
                'is_active' => $sponsor->is_active,
                'sponsor_amount' => $sponsor->sponsor_amount,
                'renewal_months' => $sponsor->renewal_months,
                'has_logo' => (bool) $sponsor->logo_mime,
                'logo_url' => $sponsor->logo_mime ? '/sponsor-logo/'.$sponsor->id : null,
                'cbe_data' => $sponsor->cbe_data,
                'cbe_fetched_at' => $sponsor->cbe_fetched_at?->toDateTimeString(),
                'created_at' => $sponsor->created_at->toDateString(),
            ],
        ]);
    }

    public function refresh(Sponsor $sponsor, CbeApiService $service): RedirectResponse
    {
        if (! $sponsor->vat_number) {
            return back()->with('error', 'Geen ondernemingsnummer gekend voor deze sponsor.');
        }

        $result = $service->lookupByNumber($sponsor->vat_number);

        if (! $result['success']) {
            return back()->with('error', $result['error']);
        }

        $data = $result['data'];

        $apiFields = [
            'name' => $data['company_name'] ?? null,
            'address_street' => $data['address_street'] ?? null,
            'address_city' => $data['address_city'] ?? null,
            'address_postal_code' => $data['address_postal_code'] ?? null,
            'legal_form' => $data['legal_form'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'website' => $data['website'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
        ];

        $updates = array_filter($apiFields, fn ($value) => $value !== null && $value !== '');
        $updates['cbe_data'] = $data;
        $updates['cbe_fetched_at'] = now();

        $sponsor->update($updates);

        return back()->with('status', 'KBO gegevens bijgewerkt.');
    }

    public function update(Request $request, Sponsor $sponsor): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'legal_form' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
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
            'legal_form' => $validated['legal_form'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'website' => $validated['website'] ?? null,
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
