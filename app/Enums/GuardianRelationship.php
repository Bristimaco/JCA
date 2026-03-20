<?php

namespace App\Enums;

enum GuardianRelationship: string
{
    case Father = 'father';
    case Mother = 'mother';
    case Guardian = 'guardian';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Father => 'Vader',
            self::Mother => 'Moeder',
            self::Guardian => 'Voogd',
            self::Other => 'Andere',
        };
    }
}
