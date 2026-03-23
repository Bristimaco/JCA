<?php

namespace App\Imports;

use App\Models\Member;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class MembersImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        // Update if id exists, else create
        $member = isset($row['id']) ? Member::find($row['id']) : null;
        if (! $member) {
            $member = new Member;
        }
        $member->fill([
            'first_name' => $row['first_name'] ?? null,
            'last_name' => $row['last_name'] ?? null,
            'date_of_birth' => $row['date_of_birth'] ?? null,
            'gender' => $row['gender'] ?? null,
            'email' => $row['email'] ?? null,
            'phone' => $row['phone'] ?? null,
            'address_street' => $row['address_street'] ?? null,
            'address_city' => $row['address_city'] ?? null,
            'address_postal_code' => $row['address_postal_code'] ?? null,
            'address_country' => $row['address_country'] ?? null,
            'membership_status' => $row['membership_status'] ?? null,
            'membership_start_date' => $row['membership_start_date'] ?? null,
            'membership_end_date' => $row['membership_end_date'] ?? null,
            'is_competition' => $row['is_competition'] ?? null,
            'nationality' => $row['nationality'] ?? null,
            'national_member_id' => $row['national_member_id'] ?? null,
            'emergency_contact_name' => $row['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $row['emergency_contact_phone'] ?? null,
            'medical_notes' => $row['medical_notes'] ?? null,
            'notes' => $row['notes'] ?? null,
        ]);
        $member->save();

        return $member;
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required',
            'last_name' => 'required',
            'date_of_birth' => 'required|date',
        ];
    }
}
