<?php

namespace App\Jobs;

use App\Models\Prospect;
use App\Services\CbeApiService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ImportProspect implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(
        public string $vatNumber,
    ) {}

    public function handle(CbeApiService $service): void
    {
        $result = $service->lookupByNumber($this->vatNumber);

        if (! $result['success']) {
            Log::warning('ImportProspect API failed', [
                'vat_number' => $this->vatNumber,
                'error' => $result['error'] ?? 'Unknown error',
            ]);

            throw new RuntimeException('CBE API lookup failed for '.$this->vatNumber.': '.($result['error'] ?? 'Unknown error'));
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

    public function failed(\Throwable $exception): void
    {
        Log::error('ImportProspect failed', [
            'vat_number' => $this->vatNumber,
            'message' => $exception->getMessage(),
        ]);
    }
}
