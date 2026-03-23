<?php

namespace App\Enums;

enum InvitationStatus: string
{
    case Pending = 'pending';
    case Invited = 'invited';
    case Accepted = 'accepted';
    case Declined = 'declined';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Nog niet uitgenodigd',
            self::Invited => 'Uitgenodigd',
            self::Accepted => 'Neemt deel',
            self::Declined => 'Neemt niet deel',
        };
    }
}
