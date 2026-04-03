<?php

namespace App\Enums;

enum ExtraModule: string
{
    case Members = 'members';
    case Training = 'training';
    case Tournaments = 'tournaments';
    case Bar = 'bar';
    case Events = 'events';
    case Sponsors = 'sponsors';
    case Announcements = 'announcements';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Members => 'Ledenbeheer',
            self::Training => 'Trainingen',
            self::Tournaments => 'Toernooien',
            self::Bar => 'Bar & Kassa',
            self::Events => 'Evenementen Beheer',
            self::Sponsors => 'Sponsoring',
            self::Announcements => 'Mededelingen',
            self::Admin => 'Beheer',
        };
    }
}
