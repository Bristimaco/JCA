<?php

namespace App\Enums;

enum MembershipStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Suspended = 'suspended';
    case Pending = 'pending';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Actief',
            self::Inactive => 'Inactief',
            self::Suspended => 'Geschorst',
            self::Pending => 'In afwachting',
        };
    }
}
