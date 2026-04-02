<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClubSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ClubSettingsController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:255'],
            'address_postal_code' => ['nullable', 'string', 'max:10'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'remove_logo' => ['boolean'],
            'attendance_pin' => ['nullable', 'string', 'min:4', 'max:8'],
            'attendance_threshold' => ['nullable', 'integer', 'min:0', 'max:100'],
            'default_membership_fee' => ['nullable', 'numeric', 'min:0'],
            'sponsor_frequency_bronze' => ['nullable', 'integer', 'min:5'],
            'sponsor_frequency_silver' => ['nullable', 'integer', 'min:5'],
            'sponsor_frequency_gold' => ['nullable', 'integer', 'min:5'],
            'slide_duration_results' => ['nullable', 'integer', 'min:5'],
            'slide_duration_announcements' => ['nullable', 'integer', 'min:5'],
            'mollie_expiry_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'test_mode' => ['boolean'],
        ]);

        $settings = ClubSettings::first();

        $data = [
            'name' => $validated['name'],
            'address_street' => $validated['address_street'] ?? null,
            'address_city' => $validated['address_city'] ?? null,
            'address_postal_code' => $validated['address_postal_code'] ?? null,
            'attendance_pin' => $validated['attendance_pin'] ?? null,
            'attendance_threshold' => $validated['attendance_threshold'] ?? 70,
            'default_membership_fee' => $validated['default_membership_fee'] ?? null,
            'sponsor_frequency_bronze' => $validated['sponsor_frequency_bronze'] ?? 60,
            'sponsor_frequency_silver' => $validated['sponsor_frequency_silver'] ?? 30,
            'sponsor_frequency_gold' => $validated['sponsor_frequency_gold'] ?? 15,
            'slide_duration_results' => $validated['slide_duration_results'] ?? 15,
            'slide_duration_announcements' => $validated['slide_duration_announcements'] ?? 15,
            'mollie_expiry_days' => $validated['mollie_expiry_days'] ?? 14,
            'test_mode' => $validated['test_mode'] ?? false,
        ];

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $data['logo_data'] = base64_encode(file_get_contents($file->getRealPath()));
            $data['logo_mime_type'] = $file->getMimeType();
        } elseif ($request->boolean('remove_logo')) {
            $data['logo_data'] = null;
            $data['logo_mime_type'] = null;
        }

        $settings->update($data);

        return back()->with('status', 'Clubinstellingen bijgewerkt.');
    }
}
