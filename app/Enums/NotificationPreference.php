<?php

namespace App\Enums;

enum NotificationPreference: string
{
    case Email = 'email';
    case App = 'app';
    case Both = 'both';

    public function label(): string
    {
        return match ($this) {
            self::Email => 'Alleen e-mail',
            self::App => 'Alleen in-app',
            self::Both => 'Beide',
        };
    }

    public function wantsEmail(): bool
    {
        return $this === self::Email || $this === self::Both;
    }

    public function wantsApp(): bool
    {
        return $this === self::App || $this === self::Both;
    }
}
