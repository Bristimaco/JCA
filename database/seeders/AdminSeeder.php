<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'admin@jca.be'],
            [
                'name' => 'Admin',
                'password' => 'Admin2026!',
                'email_verified_at' => now(),
                'role' => UserRole::Admin,
                'is_active' => true,
            ]
        );

        // Force password update in case it was already hashed differently
        $user->password = 'Admin2026!';
        $user->save();
    }
}
