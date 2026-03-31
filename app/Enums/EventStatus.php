<?php

namespace App\Enums;

enum EventStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Concept',
            self::Published => 'Gepubliceerd',
            self::Archived => 'Gearchiveerd',
        };
    }
}
