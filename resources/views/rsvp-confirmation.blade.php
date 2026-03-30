<!DOCTYPE html>
<html lang="nl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bevestiging</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
            padding: 48px;
            max-width: 480px;
            text-align: center;
        }

        .icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        h1 {
            font-size: 22px;
            color: #111827;
            margin: 0 0 12px;
        }

        p {
            font-size: 15px;
            color: #6b7280;
            margin: 0;
        }

        .btn {
            display: inline-block;
            margin-top: 24px;
            padding: 10px 24px;
            background-color: #e11d48;
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 8px;
        }
    </style>
</head>

<body>
    <div class="card">
        @if($expired ?? false)
            <div class="icon">⏰</div>
            <h1>Deadline verlopen</h1>
            <p>De uitnodigingsdeadline voor <strong>{{ $tournamentName }}</strong> is verlopen. Neem contact op met de club
                als je toch wilt reageren.</p>
        @elseif($paymentRequired ?? false)
            <div class="icon">💳</div>
            <h1>Betaling vereist</h1>
            <p>Om deel te nemen aan <strong>{{ $tournamentName }}</strong> moet je eerst het inschrijfgeld betalen. Na betaling wordt je deelname automatisch bevestigd.</p>
            @if($paymentUrl ?? null)
                <a href="{{ $paymentUrl }}" class="btn" style="background-color:#2563eb;">💳 Betaal inschrijfgeld</a>
            @endif
        @elseif($status === \App\Enums\InvitationStatus::Accepted)
            <div class="icon">✅</div>
            <h1>Bedankt, {{ $memberName }}!</h1>
            <p>Je deelname aan <strong>{{ $tournamentName }}</strong> is bevestigd.</p>
        @else
            <div class="icon">📋</div>
            <h1>Bedankt, {{ $memberName }}!</h1>
            <p>Je hebt aangegeven niet deel te nemen aan <strong>{{ $tournamentName }}</strong>.</p>
        @endif

        <a href="/" class="btn">Terug naar de app</a>
    </div>
</body>

</html>