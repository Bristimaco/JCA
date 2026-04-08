<?php

namespace App\Enums;

enum StageStatus: string
{
    case Preparation = 'preparation';
    case InvitationsSent = 'invitations_sent';
    case RegistrationsOpen = 'registrations_open';
    case RegistrationsClosed = 'registrations_closed';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Preparation => 'Voorbereiding',
            self::InvitationsSent => 'Uitnodigingen verstuurd',
            self::RegistrationsOpen => 'Inschrijvingen open',
            self::RegistrationsClosed => 'Inschrijvingen voltooid',
            self::Archived => 'Gearchiveerd',
        };
    }

    public function previous(): ?self
    {
        return match ($this) {
            self::Preparation => null,
            self::InvitationsSent => self::Preparation,
            self::RegistrationsOpen => self::InvitationsSent,
            self::RegistrationsClosed => self::RegistrationsOpen,
            self::Archived => self::RegistrationsClosed,
        };
    }
}
