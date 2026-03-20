<?php

namespace Database\Factories;

use App\Enums\Gender;
use App\Enums\MembershipStatus;
use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

class MemberFactory extends Factory
{
    protected $model = Member::class;

    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'date_of_birth' => fake()->dateTimeBetween('-30 years', '-6 years'),
            'gender' => fake()->randomElement(Gender::cases()),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'address_street' => fake()->streetAddress(),
            'address_city' => fake()->city(),
            'address_postal_code' => fake()->postcode(),
            'address_country' => 'BE',
            'membership_status' => MembershipStatus::Active,
            'membership_start_date' => fake()->dateTimeBetween('-5 years', '-1 year'),
            'is_competition' => fake()->boolean(30),
        ];
    }

    public function active(): static
    {
        return $this->state(['membership_status' => MembershipStatus::Active]);
    }

    public function inactive(): static
    {
        return $this->state(['membership_status' => MembershipStatus::Inactive]);
    }

    public function withLicense(): static
    {
        return $this->state(['license_number' => 'JCA-'.fake()->unique()->numerify('######')]);
    }
}
