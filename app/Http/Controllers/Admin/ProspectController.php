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
    public function index(): Response
    {
        $prospects = Prospect::orderByDesc('created_at')
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
                'created_at' => $p->created_at->toDateString(),
            ]);

        return Inertia::render('Admin/Prospectie', [
            'prospects' => $prospects,
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

            ImportProspect::dispatch($digits)->delay(now()->addSeconds($dispatched * 2));
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

    public function convertToSponsor(Prospect $prospect): RedirectResponse
    {
        Sponsor::create([
            'name' => $prospect->company_name,
            'address_street' => $prospect->address_street,
            'address_city' => $prospect->address_city,
            'address_postal_code' => $prospect->address_postal_code,
            'tier' => 'bronze',
            'contract_start_date' => now()->toDateString(),
            'contract_end_date' => now()->addYear()->toDateString(),
            'is_active' => true,
        ]);

        return redirect('/admin/sponsors')->with('status', "'{$prospect->company_name}' omgezet naar sponsor.");
    }
}
