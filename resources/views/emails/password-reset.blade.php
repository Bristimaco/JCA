<!DOCTYPE html>
<html lang="nl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wachtwoord resetten</title>
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
                                        <h1 style="color:#ffffff;margin:0;font-size:22px;">Wachtwoord resetten</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:32px;">
                            <p style="font-size:16px;color:#111827;margin:0 0 16px;">
                                Beste {{ $user->name }},
                            </p>
                            <p style="font-size:15px;color:#374151;margin:0 0 24px;">
                                U ontvangt deze e-mail omdat er een verzoek is ingediend om het wachtwoord van uw account te resetten.
                            </p>

                            {{-- Button --}}
                            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                                <tr>
                                    <td style="background-color:#1e40af;border-radius:6px;">
                                        <a href="{{ $resetUrl }}" target="_blank"
                                            style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">
                                            Wachtwoord resetten
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size:14px;color:#6b7280;margin:0 0 16px;">
                                Deze link is 60 minuten geldig. Als u geen wachtwoord reset heeft aangevraagd, kunt u deze e-mail negeren.
                            </p>

                            <p style="font-size:14px;color:#6b7280;margin:24px 0 0;">
                                Met sportieve groeten,<br>
                                <strong>{{ $club->name }}</strong>
                            </p>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
                            <p style="font-size:12px;color:#9ca3af;margin:0;text-align:center;">
                                Dit is een automatisch bericht van {{ $club->name }}.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
