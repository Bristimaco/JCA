<?php

namespace App\Enums;

enum TournamentStatus: string
{
    case Preparation = 'preparation';
    case InvitationsSent = 'invitations_sent';
    case RegistrationsOpen = 'registrations_open';
    case RegistrationsClosed = 'registrations_closed';
    case Started = 'started';
    case Finished = 'finished';

    public function label(): string
    {
        return match ($this) {
            self::Preparation => 'Voorbereiding',
            self::InvitationsSent => 'Uitnodigingen verstuurd',
            self::RegistrationsOpen => 'Inschrijvingen gestart',
            self::RegistrationsClosed => 'Inschrijvingen voltooid',
            self::Started => 'Gestart',
            self::Finished => 'Afgelopen',
        };
    }
}
