<?php

namespace App\Enums;

enum EventStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case RegistrationClosed = 'registration_closed';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Concept',
            self::Published => 'Gepubliceerd',
            self::RegistrationClosed => 'Inschrijvingen gesloten',
            self::Archived => 'Gearchiveerd',
        };
    }
}
