<!DOCTYPE html>
<html lang="nl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $registered ? 'Inschrijving' : 'Uitschrijving' }} {{ $tournament->name }}</title>
</head>

<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    {{-- Header --}}
                    <tr>
                        <td style="background-color:{{ $registered ? '#16a34a' : '#dc2626' }};padding:24px 32px;">
                            <h1 style="color:#ffffff;margin:0;font-size:22px;">
                                {{ $registered ? 'Inschrijving bevestigd' : 'Uitschrijving' }}
                            </h1>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:32px;">
                            <p style="font-size:16px;color:#111827;margin:0 0 16px;">
                                Beste {{ $member->fullName() }},
                            </p>

                            @if($registered)
                                <p style="font-size:15px;color:#374151;margin:0 0 24px;">
                                    Je bent ingeschreven voor het toernooi <strong>{{ $tournament->name }}</strong>.
                                </p>
                            @else
                                <p style="font-size:15px;color:#374151;margin:0 0 24px;">
                                    Je inschrijving voor het toernooi <strong>{{ $tournament->name }}</strong> is
                                    geannuleerd.
                                </p>
                            @endif

                            {{-- Tournament details --}}
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color:#f9fafb;border-radius:6px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:16px;">
                                        <table cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
                                            <tr>
                                                <td style="padding:4px 16px 4px 0;font-weight:bold;">Datum:</td>
                                                <td style="padding:4px 0;">
                                                    {{ $tournament->tournament_date->format('d/m/Y') }}</td>
                                            </tr>
                                            @if($tournament->address_street || $tournament->address_city)
                                                <tr>
                                                    <td style="padding:4px 16px 4px 0;font-weight:bold;">Adres:</td>
                                                    <td style="padding:4px 0;">
                                                        {{ collect([$tournament->address_street, $tournament->address_postal_code, $tournament->address_city])->filter()->join(', ') }}
                                                    </td>
                                                </tr>
                                            @endif
                                            @if($registered && $ageCategory)
                                                <tr>
                                                    <td style="padding:4px 16px 4px 0;font-weight:bold;">Leeftijdscategorie:
                                                    </td>
                                                    <td style="padding:4px 0;">{{ $ageCategory }}</td>
                                                </tr>
                                            @endif
                                            @if($registered && $weightCategory)
                                                <tr>
                                                    <td style="padding:4px 16px 4px 0;font-weight:bold;">Gewichtsklasse:
                                                    </td>
                                                    <td style="padding:4px 0;">{{ $weightCategory }}</td>
                                                </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size:13px;color:#6b7280;margin:0;">
                                Bij vragen kan je contact opnemen met de club.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>