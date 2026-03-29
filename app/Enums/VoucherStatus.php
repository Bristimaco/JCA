<?php

namespace App\Enums;

enum VoucherStatus: string
{
    case Active = 'active';
    case Redeemed = 'redeemed';
    case Expired = 'expired';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Actief',
            self::Redeemed => 'Verbruikt',
            self::Expired => 'Verlopen',
        };
    }
}
