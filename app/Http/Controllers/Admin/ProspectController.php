<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ImportProspect;
use App\Models\Prospect;
use App\Models\Sponsor;
use App\Services\CbeApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class ProspectController extends Controller
{
    public function index(Request $request): Response
    {
        $showArchived = $request->boolean('archived');

        $prospects = Prospect::when($showArchived, fn ($q) => $q->archived(), fn ($q) => $q->active())
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Prospect $p) => [
                'id' => $p->id,
                'vat_number' => $p->vat_number,
                'company_name' => $p->company_name,
                'address_city' => $p->address_city,
                'legal_form' => $p->legal_form,
                'phone' => $p->phone,
                'email' => $p->email,
                'website' => $p->website,
                'status' => $p->cbe_data['status'] ?? null,
                'notes_count' => $p->notes()->count(),
                'archived_reason' => $p->archived_reason,
                'created_at' => $p->created_at->toDateString(),
            ]);

        return Inertia::render('Admin/Prospectie', [
            'prospects' => $prospects,
            'showArchived' => $showArchived,
        ]);
    }

    public function lookup(Request $request, CbeApiService $service): JsonResponse
    {
        $request->validate([
            'vat_number' => ['required', 'string', 'max:20'],
        ]);

        $result = $service->lookupByNumber($request->input('vat_number'));

        return response()->json($result);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vat_number' => ['required', 'string', 'max:20', 'unique:prospects,vat_number'],
            'company_name' => ['required', 'string', 'max:255'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'legal_form' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'string', 'max:255'],
            'website' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'cbe_data' => ['nullable', 'array'],
        ]);

        $validated['cbe_fetched_at'] = now();

        Prospect::create($validated);

        return back()->with('status', "Prospect '{$validated['company_name']}' toegevoegd.");
    }

    public function show(Prospect $prospect): Response
    {
        $prospect->load(['notes' => fn ($q) => $q->with('creator:id,name')->orderByDesc('created_at')]);

        return Inertia::render('Admin/ProspectDetail', [
            'prospect' => [
                'id' => $prospect->id,
                'vat_number' => $prospect->vat_number,
                'company_name' => $prospect->company_name,
                'address_street' => $prospect->address_street,
                'address_city' => $prospect->address_city,
                'address_postal_code' => $prospect->address_postal_code,
                'legal_form' => $prospect->legal_form,
                'phone' => $prospect->phone,
                'email' => $prospect->email,
                'website' => $prospect->website,
                'latitude' => $prospect->latitude,
                'longitude' => $prospect->longitude,
                'sponsor_amount' => $prospect->sponsor_amount,
                'sponsor_start_date' => $prospect->sponsor_start_date?->toDateString(),
                'sponsor_renewal_months' => $prospect->sponsor_renewal_months,
                'sponsor_tier' => $prospect->sponsor_tier,
                'has_logo' => (bool) $prospect->logo_mime,
                'logo_url' => $prospect->logoDataUri(),
                'archived_at' => $prospect->archived_at?->toDateTimeString(),
                'archived_reason' => $prospect->archived_reason,
                'cbe_data' => $prospect->cbe_data,
                'cbe_fetched_at' => $prospect->cbe_fetched_at?->toDateTimeString(),
                'notes_field' => $prospect->getAttributeValue('notes'),
                'created_at' => $prospect->created_at->toDateString(),
                'notes' => $prospect->getRelation('notes')->map(fn ($n) => [
                    'id' => $n->id,
                    'content' => $n->content,
                    'creator_name' => $n->creator?->name ?? 'Onbekend',
                    'created_at' => $n->created_at->format('d/m/Y H:i'),
                ]),
            ],
        ]);
    }

    public function refresh(Prospect $prospect, CbeApiService $service): RedirectResponse
    {
        $result = $service->lookupByNumber($prospect->vat_number);

        if (! $result['success']) {
            return back()->with('error', $result['error']);
        }

        $data = $result['data'];

        $prospect->update([
            'company_name' => $data['company_name'],
            'address_street' => $data['address_street'],
            'address_city' => $data['address_city'],
            'address_postal_code' => $data['address_postal_code'],
            'legal_form' => $data['legal_form'],
            'phone' => $data['phone'],
            'email' => $data['email'],
            'website' => $data['website'],
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'cbe_data' => $data,
            'cbe_fetched_at' => now(),
        ]);

        return back()->with('status', 'KBO gegevens bijgewerkt.');
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx'],
        ]);

        $rows = Excel::toArray(null, $request->file('file'));
        $dispatched = 0;

        foreach ($rows[0] ?? [] as $row) {
            $raw = $row[0] ?? null;
            if (! $raw) {
                continue;
            }

            $digits = preg_replace('/\D/', '', (string) $raw);
            if (strlen($digits) < 9 || strlen($digits) > 10) {
                continue;
            }

            $digits = str_pad($digits, 10, '0', STR_PAD_LEFT);

            ImportProspect::dispatch($digits)->delay(now()->addSeconds($dispatched * 3));
            $dispatched++;
        }

        return back()->with('status', "{$dispatched} prospecten worden op de achtergrond verwerkt.");
    }

    public function destroy(Prospect $prospect): RedirectResponse
    {
        $name = $prospect->company_name;
        $prospect->delete();

        return redirect()->route('admin.prospects.index')->with('status', "Prospect '{$name}' verwijderd.");
    }

    public function update(Request $request, Prospect $prospect): RedirectResponse
    {
        $validated = $request->validate([
            'sponsor_amount' => ['nullable', 'numeric', 'min:0'],
            'sponsor_start_date' => ['nullable', 'date'],
            'sponsor_renewal_months' => ['nullable', 'integer', 'in:6,12,24,36'],
            'sponsor_tier' => ['nullable', 'string', 'in:bronze,silver,gold'],
            'logo' => ['nullable', 'string'],
            'remove_logo' => ['nullable', 'boolean'],
        ]);

        $prospect->sponsor_amount = $validated['sponsor_amount'] ?? null;
        $prospect->sponsor_start_date = $validated['sponsor_start_date'] ?? null;
        $prospect->sponsor_renewal_months = $validated['sponsor_renewal_months'] ?? null;
        $prospect->sponsor_tier = $validated['sponsor_tier'] ?? null;

        if (! empty($validated['remove_logo'])) {
            $prospect->logo_data = null;
            $prospect->logo_mime = null;
        } elseif (! empty($validated['logo'])) {
            $this->applyLogo($prospect, $validated['logo']);
        }

        $prospect->save();

        return back()->with('status', 'Sponsorgegevens bijgewerkt.');
    }

    public function convertToSponsor(Prospect $prospect): RedirectResponse
    {
        $startDate = $prospect->sponsor_start_date ?? now();
        $renewalMonths = $prospect->sponsor_renewal_months ?? 12;

        $sponsorData = [
            'name' => $prospect->company_name,
            'address_street' => $prospect->address_street,
            'address_city' => $prospect->address_city,
            'address_postal_code' => $prospect->address_postal_code,
            'tier' => $prospect->sponsor_tier ?? 'bronze',
            'contract_start_date' => $startDate->toDateString(),
            'contract_end_date' => $startDate->copy()->addMonths($renewalMonths)->toDateString(),
            'is_active' => true,
            'sponsor_amount' => $prospect->sponsor_amount,
            'renewal_months' => $renewalMonths,
        ];

        if ($prospect->logo_data) {
            $sponsorData['logo_data'] = $prospect->logo_data;
            $sponsorData['logo_mime'] = $prospect->logo_mime;
        }

        Sponsor::create($sponsorData);

        $prospect->update([
            'archived_at' => now(),
            'archived_reason' => 'converted',
        ]);

        return back()->with('status', "'{$prospect->company_name}' omgezet naar sponsor en gearchiveerd.");
    }

    public function archive(Prospect $prospect): RedirectResponse
    {
        $prospect->update([
            'archived_at' => now(),
            'archived_reason' => 'no_sponsor',
        ]);

        return back()->with('status', "'{$prospect->company_name}' gearchiveerd als 'Geen sponsor'.");
    }

    public function unarchive(Prospect $prospect): RedirectResponse
    {
        $prospect->update([
            'archived_at' => null,
            'archived_reason' => null,
        ]);

        return back()->with('status', "'{$prospect->company_name}' opnieuw geactiveerd.");
    }

    private function applyLogo(Prospect $prospect, string $dataUrl): void
    {
        if (preg_match('/^data:(image\/[a-zA-Z+]+);base64,(.+)$/', $dataUrl, $matches)) {
            $prospect->logo_mime = $matches[1];
            $prospect->logo_data = $matches[2];
        }
    }
}
