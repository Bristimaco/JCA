<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@jca.be'],
            [
                'name' => 'Admin',
                'password' => 'Admin2026!',
                'email_verified_at' => now(),
                'role' => UserRole::Admin,
                'is_active' => true,
            ]
        );
    }

    public function down(): void
    {
        User::where('email', 'admin@jca.be')->delete();
    }
};
