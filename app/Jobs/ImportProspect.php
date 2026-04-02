<?php

namespace App\Jobs;

use App\Models\Prospect;
use App\Services\CbeApiService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ImportProspect implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $vatNumber,
    ) {}

    public function handle(CbeApiService $service): void
    {
        $result = $service->lookupByNumber($this->vatNumber);

        if (! $result['success']) {
            return;
        }

        $data = $result['data'];

        $fields = [
            'company_name' => $data['company_name'] ?? 'Onbekend',
            'address_street' => $data['address_street'] ?? null,
            'address_city' => $data['address_city'] ?? null,
            'address_postal_code' => $data['address_postal_code'] ?? null,
            'legal_form' => $data['legal_form'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'website' => $data['website'] ?? null,
            'latitude' => $data['latitude'] ?? null,
            'longitude' => $data['longitude'] ?? null,
            'cbe_data' => $data,
            'cbe_fetched_at' => now(),
        ];

        $existing = Prospect::where('vat_number', $this->vatNumber)->first();

        if ($existing) {
            $existing->update($fields);
        } else {
            Prospect::create(array_merge(['vat_number' => $data['vat_number'] ?? $this->vatNumber], $fields));
        }
    }
}
