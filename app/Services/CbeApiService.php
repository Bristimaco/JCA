<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CbeApiService
{
    private string $baseUrl = 'https://cbeapi.be/api';

    private string $token;

    public function __construct()
    {
        $this->token = config('services.cbe.token');
    }

    public function lookupByNumber(string $cbeNumber): array
    {
        $cbeNumber = preg_replace('/[^0-9]/', '', $cbeNumber);

        try {
            $response = Http::withToken($this->token)
                ->timeout(10)
                ->get("{$this->baseUrl}/v1/company/{$cbeNumber}", [
                    'lang' => 'nl',
                ]);

            if ($response->status() === 404) {
                return [
                    'success' => false,
                    'error' => 'Onderneming niet gevonden in de KBO.',
                ];
            }

            if (! $response->successful()) {
                return [
                    'success' => false,
                    'error' => 'Fout bij het opvragen van KBO gegevens (HTTP '.$response->status().').',
                ];
            }

            $company = $response->json('data');

            if (! $company) {
                return [
                    'success' => false,
                    'error' => 'Ongeldig antwoord van de KBO API.',
                ];
            }

            return [
                'success' => true,
                'data' => $this->parseCompanyResponse($company, $cbeNumber),
            ];
        } catch (\Exception $e) {
            Log::error('CBE API error', ['message' => $e->getMessage(), 'cbe_number' => $cbeNumber]);

            return [
                'success' => false,
                'error' => 'Fout bij het verbinden met de KBO API: '.$e->getMessage(),
            ];
        }
    }

    private function parseCompanyResponse(array $company, string $cbeNumber): array
    {
        $address = $company['address'] ?? [];
        $contactInfos = $company['contact_infos'] ?? [];

        $phone = null;
        $email = null;
        $website = null;

        foreach ($contactInfos as $contact) {
            $type = $contact['type'] ?? null;
            $value = $contact['value'] ?? null;
            if ($type === 'phone' && ! $phone) {
                $phone = $value;
            } elseif ($type === 'email' && ! $email) {
                $email = $value;
            } elseif ($type === 'web' && ! $website) {
                $website = $value;
            }
        }

        $naceActivities = array_map(fn ($a) => [
            'code' => $a['code'] ?? null,
            'description' => $a['description'] ?? null,
            'classification' => $a['classification'] ?? null,
        ], $company['nace_activities'] ?? []);

        $establishments = array_map(fn ($e) => [
            'cbe_number' => $e['cbe_number_formatted'] ?? $e['cbe_number'] ?? null,
            'denomination' => $e['denomination'] ?? null,
            'address' => $e['address']['full_address'] ?? null,
        ], $company['establishments'] ?? []);

        return [
            'vat_number' => $cbeNumber,
            'cbe_number_formatted' => $company['cbe_number_formatted'] ?? null,
            'company_name' => $company['denomination'] ?? $company['commercial_name'] ?? '',
            'commercial_name' => $company['commercial_name'] ?? null,
            'legal_form' => $company['juridical_form_short'] ?? $company['juridical_form'] ?? null,
            'address_street' => trim(($address['street'] ?? '').' '.($address['street_number'] ?? '').' '.($address['box'] ?? '')),
            'address_postal_code' => $address['post_code'] ?? null,
            'address_city' => $address['city'] ?? null,
            'full_address' => $address['full_address'] ?? null,
            'phone' => $phone,
            'email' => $email,
            'website' => $website,
            'status' => $company['status'] ?? null,
            'juridical_situation' => $company['juridical_situation'] ?? null,
            'type' => $company['pretty_type'] ?? $company['type'] ?? null,
            'start_date' => $company['start_date'] ?? null,
            'nace_activities' => $naceActivities,
            'establishments' => $establishments,
            ...$this->geocodeAddress($address['full_address'] ?? null),
        ];
    }

    private function geocodeAddress(?string $fullAddress): array
    {
        if (! $fullAddress) {
            return ['latitude' => null, 'longitude' => null];
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'JudoClubApp/1.0 (prospect-lookup)',
            ])
                ->timeout(5)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $fullAddress,
                    'format' => 'json',
                    'limit' => 1,
                ]);

            $results = $response->json();

            if (! empty($results[0]['lat']) && ! empty($results[0]['lon'])) {
                return [
                    'latitude' => (float) $results[0]['lat'],
                    'longitude' => (float) $results[0]['lon'],
                ];
            }
        } catch (\Exception $e) {
            Log::warning('Nominatim geocoding failed', ['address' => $fullAddress, 'error' => $e->getMessage()]);
        }

        return ['latitude' => null, 'longitude' => null];
    }
}
