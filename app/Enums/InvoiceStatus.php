<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Expired = 'expired';
    case Failed = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'In afwachting',
            self::Paid => 'Betaald',
            self::Expired => 'Verlopen',
            self::Failed => 'Mislukt',
        };
    }
}
