<?php

namespace App\Exports;

use App\Models\Member;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MembersExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Member::all([
            'id',
            'first_name',
            'last_name',
            'date_of_birth',
            'gender',
            'email',
            'phone',
            'address_street',
            'address_city',
            'address_postal_code',
            'address_country',
            'membership_status',
            'membership_start_date',
            'membership_end_date',
            'membership_renewal_date',
            'is_competition',
            'is_trainer',
            'nationality',
            'national_member_id',
            'emergency_contact_name',
            'emergency_contact_phone',
            'medical_notes',
            'notes',
        ]);
    }

    public function map($member): array
    {
        return [
            $member->id,
            $member->first_name,
            $member->last_name,
            $member->date_of_birth?->format('d/m/Y'),
            $member->gender?->value,
            $member->email,
            $member->phone,
            $member->address_street,
            $member->address_city,
            $member->address_postal_code,
            $member->address_country,
            $member->membership_status?->value,
            $member->membership_start_date?->format('d/m/Y'),
            $member->membership_end_date?->format('d/m/Y'),
            $member->membership_renewal_date?->format('d/m/Y'),
            $member->is_competition,
            $member->is_trainer,
            $member->nationality,
            $member->national_member_id,
            $member->emergency_contact_name,
            $member->emergency_contact_phone,
            $member->medical_notes,
            $member->notes,
        ];
    }

    public function headings(): array
    {
        return [
            'id',
            'first_name',
            'last_name',
            'date_of_birth',
            'gender',
            'email',
            'phone',
            'address_street',
            'address_city',
            'address_postal_code',
            'address_country',
            'membership_status',
            'membership_start_date',
            'membership_end_date',
            'membership_renewal_date',
            'is_competition',
            'is_trainer',
            'nationality',
            'national_member_id',
            'emergency_contact_name',
            'emergency_contact_phone',
            'medical_notes',
            'notes',
        ];
    }
}
