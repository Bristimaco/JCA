<!DOCTYPE html>
<html lang="nl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Uitnodiging {{ $stage->name }}</title>
</head>

<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    {{-- Header --}}
                    <tr>
                        <td style="background-color:#0d9488;padding:24px 32px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    @if($club->logo_data)
                                        <td style="padding-right:16px;vertical-align:middle;">
                                            <img src="{{ route('club.logo') }}" alt="" width="40" height="40"
                                                style="display:block;border-radius:4px;" />
                                        </td>
                                    @endif
                                    <td style="vertical-align:middle;">
                                        <h1 style="color:#ffffff;margin:0;font-size:22px;">Uitnodiging Stage</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:32px;">
                            <p style="font-size:16px;color:#111827;margin:0 0 16px;">
                                Beste {{ $member->fullName() }},
                            </p>
                            <p style="font-size:15px;color:#374151;margin:0 0 24px;">
                                Je bent uitgenodigd voor de volgende stage:
                            </p>

                            {{-- Stage details --}}
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color:#f9fafb;border-radius:6px;padding:16px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:16px;">
                                        <h2 style="margin:0 0 12px;color:#111827;font-size:18px;">
                                            {{ $stage->name }}
                                        </h2>

                                        <table cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
                                            <tr>
                                                <td style="padding:4px 16px 4px 0;font-weight:bold;vertical-align:top;">
                                                    Van:</td>
                                                <td style="padding:4px 0;">
                                                    {{ $stage->start_date->format('d/m/Y') }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:4px 16px 4px 0;font-weight:bold;vertical-align:top;">
                                                    Tot:</td>
                                                <td style="padding:4px 0;">
                                                    {{ $stage->end_date->format('d/m/Y') }}
                                                </td>
                                            </tr>
                                            @if($stage->invitation_deadline)
                                                <tr>
                                                    <td style="padding:4px 16px 4px 0;font-weight:bold;vertical-align:top;">
                                                        Antwoord vóór:</td>
                                                    <td style="padding:4px 0;">
                                                        {{ $stage->invitation_deadline->format('d/m/Y') }}
                                                    </td>
                                                </tr>
                                            @endif
                                            @if($stage->address_street || $stage->address_city)
                                                <tr>
                                                    <td style="padding:4px 16px 4px 0;font-weight:bold;vertical-align:top;">
                                                        Adres:</td>
                                                    <td style="padding:4px 0;">
                                                        {{ collect([$stage->address_street, $stage->address_postal_code, $stage->address_city])->filter()->join(', ') }}
                                                    </td>
                                                </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            {{-- Map --}}
                            @if($stage->latitude && $stage->longitude)
                                <div style="margin-bottom:24px;">
                                    <a href="https://www.openstreetmap.org/?mlat={{ $stage->latitude }}&mlon={{ $stage->longitude }}#map=15/{{ $stage->latitude }}/{{ $stage->longitude }}"
                                        target="_blank" style="text-decoration:none;">
                                        <img src="https://staticmap.openstreetmap.de/staticmap.php?center={{ $stage->latitude }},{{ $stage->longitude }}&zoom=14&size=560x200&markers={{ $stage->latitude }},{{ $stage->longitude }},lightblue"
                                            width="560" height="200" alt="Locatie"
                                            style="border-radius:6px;display:block;max-width:100%;" />
                                    </a>
                                </div>
                            @endif

                            {{-- Attachments --}}
                            @if($stage->attachments->isNotEmpty())
                                <div style="margin-bottom:24px;">
                                    <p style="font-size:14px;font-weight:bold;color:#374151;margin:0 0 8px;">Bijlagen:</p>
                                    @foreach($stage->attachments as $attachment)
                                        <a href="{{ route('stage-attachments.show', $attachment) }}" target="_blank"
                                            style="display:inline-block;margin-right:8px;margin-bottom:4px;font-size:13px;color:#2563eb;text-decoration:underline;">
                                            {{ $attachment->original_name }}
                                        </a>
                                    @endforeach
                                </div>
                            @endif

                            {{-- RSVP buttons --}}
                            @if(!empty($paymentUrl))
                                <p style="font-size:15px;color:#374151;margin:0 0 16px;">
                                    Deze stage heeft een inschrijfgeld van <strong>&euro;{{ number_format($entryFee, 2, ',', '.') }}</strong>.
                                    Na betaling wordt je deelname automatisch bevestigd.
                                </p>

                                <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                    <tr>
                                        <td style="padding-right:12px;">
                                            <a href="{{ $paymentUrl }}"
                                                style="display:inline-block;padding:12px 32px;background-color:#0d9488;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:6px;">
                                                💳 Betaal inschrijfgeld
                                            </a>
                                        </td>
                                        <td>
                                            <a href="{{ $declineUrl }}"
                                                style="display:inline-block;padding:12px 32px;background-color:#dc2626;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:6px;">
                                                ✗ Niet deelnemen
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            @else
                                <p style="font-size:15px;color:#374151;margin:0 0 16px;">
                                    Gelieve je deelname te bevestigen door op een van de onderstaande knoppen te klikken:
                                </p>

                                <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                    <tr>
                                        <td style="padding-right:12px;">
                                            <a href="{{ $acceptUrl }}"
                                                style="display:inline-block;padding:12px 32px;background-color:#16a34a;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:6px;">
                                                ✓ Deelnemen
                                            </a>
                                        </td>
                                        <td>
                                            <a href="{{ $declineUrl }}"
                                                style="display:inline-block;padding:12px 32px;background-color:#dc2626;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none;border-radius:6px;">
                                                ✗ Niet deelnemen
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            @endif
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
                            <p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;">
                                {{ $club->name }} &mdash; Deze e-mail is automatisch verzonden.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>