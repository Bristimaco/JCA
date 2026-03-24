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
        ]);

        $settings = ClubSettings::first();

        $data = [
            'name' => $validated['name'],
            'address_street' => $validated['address_street'] ?? null,
            'address_city' => $validated['address_city'] ?? null,
            'address_postal_code' => $validated['address_postal_code'] ?? null,
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
        ClubSettings::clearCache();

        return back()->with('status', 'Clubinstellingen bijgewerkt.');
    }
}
