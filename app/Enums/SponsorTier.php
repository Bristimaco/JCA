<?php

namespace App\Enums;

enum SponsorTier: string
{
    case Bronze = 'bronze';
    case Silver = 'silver';
    case Gold = 'gold';

    public function label(): string
    {
        return match ($this) {
            self::Bronze => 'Brons',
            self::Silver => 'Zilver',
            self::Gold => 'Goud',
        };
    }
}
