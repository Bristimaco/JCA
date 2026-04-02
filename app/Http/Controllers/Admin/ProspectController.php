<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prospect;
use App\Models\Sponsor;
use App\Services\CbeApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
                'email' => $p->email,
                'website' => $p->website,
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
                'cbe_data' => $prospect->cbe_data,
                'cbe_fetched_at' => $prospect->cbe_fetched_at?->toDateTimeString(),
                'notes_field' => $prospect->notes,
                'created_at' => $prospect->created_at->toDateString(),
                'notes' => $prospect->notes->map(fn ($n) => [
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
            'cbe_data' => $data,
            'cbe_fetched_at' => now(),
        ]);

        return back()->with('status', 'KBO gegevens bijgewerkt.');
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
