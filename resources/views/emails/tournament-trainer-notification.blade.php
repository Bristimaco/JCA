<!DOCTYPE html>
<html lang="nl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trainer info: {{ $tournament->name }}</title>
</head>

<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    {{-- Header --}}
                    <tr>
                        <td style="background-color:#1e40af;padding:24px 32px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    @if($club->logo_data)
                                        <td style="padding-right:16px;vertical-align:middle;">
                                            <img src="{{ route('club.logo') }}" alt="" width="40" height="40"
                                                style="display:block;border-radius:4px;" />
                                        </td>
                                    @endif
                                    <td style="vertical-align:middle;">
                                        <h1 style="color:#ffffff;margin:0;font-size:22px;">Trainer Informatie</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:32px;">
                            <p style="font-size:16px;color:#111827;margin:0 0 16px;">
                                Beste trainer,
                            </p>
                            <p style="font-size:15px;color:#374151;margin:0 0 24px;">
                                De uitnodigingsfase voor het volgende toernooi is afgesloten. Hieronder vind je de
                                toernooigegevens en de deelnemerslijst.
                            </p>

                            {{-- Tournament details --}}
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color:#f9fafb;border-radius:6px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:16px;">
                                        <h2 style="margin:0 0 12px;color:#111827;font-size:18px;">
                                            {{ $tournament->name }}
                                        </h2>
                                        <table cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
                                            <tr>
                                                <td style="padding:4px 16px 4px 0;font-weight:bold;">Datum:</td>
                                                <td style="padding:4px 0;">
                                                    {{ $tournament->tournament_date->format('d/m/Y') }}</td>
                                            </tr>
                                            @if($tournament->address_street || $tournament->address_city)
                                                <tr>
                                                    <td style="padding:4px 16px 4px 0;font-weight:bold;">Locatie:</td>
                                                    <td style="padding:4px 0;">
                                                        {{ collect([$tournament->address_street, $tournament->address_postal_code, $tournament->address_city])->filter()->join(', ') }}
                                                    </td>
                                                </tr>
                                            @endif
                                            @if($tournament->invitation_deadline)
                                                <tr>
                                                    <td style="padding:4px 16px 4px 0;font-weight:bold;">Uitnodiging
                                                        deadline:</td>
                                                    <td style="padding:4px 0;">
                                                        {{ $tournament->invitation_deadline->format('d/m/Y') }}</td>
                                                </tr>
                                            @endif
                                            @if($tournament->registration_deadline)
                                                <tr>
                                                    <td style="padding:4px 16px 4px 0;font-weight:bold;">Inschrijving
                                                        deadline:</td>
                                                    <td style="padding:4px 0;">
                                                        {{ $tournament->registration_deadline->format('d/m/Y') }}</td>
                                                </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            {{-- Participants --}}
                            <h3 style="color:#111827;font-size:16px;margin:0 0 12px;">Deelnemers
                                ({{ $participants->count() }})</h3>
                            @if($participants->isEmpty())
                                <p style="font-size:14px;color:#6b7280;">Nog geen bevestigde deelnemers.</p>
                            @else
                                <table width="100%" cellpadding="0" cellspacing="0"
                                    style="font-size:14px;color:#374151;border-collapse:collapse;">
                                    <tr style="background-color:#f3f4f6;">
                                        <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #e5e7eb;">Naam
                                        </td>
                                        <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #e5e7eb;">
                                            Geboortedatum</td>
                                        <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #e5e7eb;">
                                            Categorie</td>
                                        <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #e5e7eb;">
                                            Gewicht</td>
                                        <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #e5e7eb;">
                                            Status</td>
                                    </tr>
                                    @foreach($participants as $p)
                                        <tr>
                                            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">{{ $p['name'] }}</td>
                                            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">
                                                {{ $p['date_of_birth'] }}</td>
                                            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">
                                                {{ $p['age_category'] ?? '-' }}</td>
                                            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">
                                                {{ $p['weight_category'] ?? '-' }}</td>
                                            <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">
                                                {{ $p['invitation_status'] }}</td>
                                        </tr>
                                    @endforeach
                                </table>
                            @endif
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
                            <p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;">
                                {{ $club->club_name ?? config('app.name') }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>