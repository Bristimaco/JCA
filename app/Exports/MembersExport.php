<?php

namespace App\Exports;

use App\Models\Member;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class MembersExport implements FromCollection, WithHeadings
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
            'is_competition',
            'nationality',
            'national_member_id',
            'emergency_contact_name',
            'emergency_contact_phone',
            'medical_notes',
            'notes',
        ]);
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
            'is_competition',
            'nationality',
            'national_member_id',
            'emergency_contact_name',
            'emergency_contact_phone',
            'medical_notes',
            'notes',
        ];
    }
}
