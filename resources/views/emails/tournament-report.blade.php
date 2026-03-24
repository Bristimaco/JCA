<!DOCTYPE html>
<html lang="nl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Toernooiverslag: {{ $tournament->name }}</title>
</head>

<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    {{-- Header --}}
                    <tr>
                        <td style="background-color:#7c3aed;padding:24px 32px;">
                            <table cellpadding="0" cellspacing="0"><tr>
                                @if($club->logo_data)
                                    <td style="padding-right:16px;vertical-align:middle;">
                                        <img src="{{ route('club.logo') }}" alt="" width="40" height="40" style="display:block;border-radius:4px;" />
                                    </td>
                                @endif
                                <td style="vertical-align:middle;">
                                    <h1 style="color:#ffffff;margin:0;font-size:22px;">
                                        Toernooiverslag
                                    </h1>
                                    <p style="color:#e9d5ff;margin:8px 0 0;font-size:14px;">
                                        {{ $tournament->name }}
                                    </p>
                                </td>
                            </tr></table>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:32px;">
                            {{-- Tournament details --}}
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color:#f9fafb;border-radius:6px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:16px;">
                                        <table cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
                                            <tr>
                                                <td style="padding:4px 16px 4px 0;font-weight:bold;">Datum:</td>
                                                <td style="padding:4px 0;">
                                                    {{ $tournament->tournament_date->format('d/m/Y') }}
                                                </td>
                                            </tr>
                                            @if ($tournament->address_street || $tournament->address_city)
                                                <tr>
                                                    <td style="padding:4px 16px 4px 0;font-weight:bold;">Locatie:</td>
                                                    <td style="padding:4px 0;">
                                                        {{ collect([$tournament->address_street, $tournament->address_postal_code, $tournament->address_city])->filter()->join(', ') }}
                                                    </td>
                                                </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <h2 style="font-size:18px;color:#111827;margin:0 0 16px;">Resultaten</h2>

                            @foreach ($resultGroups as $group)
                                <table width="100%" cellpadding="0" cellspacing="0"
                                    style="margin-bottom:16px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
                                    <tr>
                                        <td colspan="3"
                                            style="background-color:#eff6ff;padding:10px 16px;font-size:13px;font-weight:bold;color:#1d4ed8;">
                                            {{ $group['age_category'] }}
                                            @if ($group['weight_category'])
                                                — {{ $group['weight_category'] }}
                                            @endif
                                        </td>
                                    </tr>
                                    @foreach ($group['results'] as $result)
                                        <tr style="border-top:1px solid #f3f4f6;">
                                            <td style="padding:8px 16px;font-size:14px;color:#374151;width:50%;">
                                                {{ $result['name'] }}
                                            </td>
                                            <td
                                                style="padding:8px 12px;font-size:14px;font-weight:bold;color:#111827;text-align:right;">
                                                {{ $result['result'] }}
                                            </td>
                                        </tr>
                                        @if ($result['notes'])
                                            <tr>
                                                <td colspan="2"
                                                    style="padding:0 16px 8px;font-size:12px;color:#6b7280;font-style:italic;">
                                                    {{ $result['notes'] }}
                                                </td>
                                            </tr>
                                        @endif
                                    @endforeach
                                </table>
                            @endforeach

                            <p style="font-size:13px;color:#6b7280;margin:24px 0 0;">
                                Je ontvangt deze e-mail omdat je hebt aangegeven interesse te hebben in de resultaten
                                van de club.
                            </p>
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