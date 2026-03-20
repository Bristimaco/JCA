<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Coach = 'coach';
    case Parent = 'parent';
    case Member = 'member';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Beheerder',
            self::Coach => 'Trainer',
            self::Parent => 'Ouder',
            self::Member => 'Lid',
        };
    }
}
