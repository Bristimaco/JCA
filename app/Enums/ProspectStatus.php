<?php

namespace App\Enums;

enum ProspectStatus: string
{
    case Inactief = 'inactief';
    case Actief = 'actief';
    case Gearchiveerd = 'gearchiveerd';

    public function label(): string
    {
        return match ($this) {
            self::Inactief => 'Inactief',
            self::Actief => 'Actief',
            self::Gearchiveerd => 'Gearchiveerd',
        };
    }
}
