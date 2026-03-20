<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@jca.be'],
            [
                'name' => 'Admin',
                'password' => bcrypt('Admin2026!'),
                'email_verified_at' => now(),
                'role' => UserRole::Admin,
            ]
        );
    }
}
