<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'admin@jca.be'],
            [
                'name' => 'Admin',
                'password' => 'Admin2026!',
                'role' => UserRole::Admin,
                'is_active' => true,
            ]
        );

        $user->forceFill(['email_verified_at' => now()])->save();
    }

    public function down(): void
    {
        User::where('email', 'admin@jca.be')->delete();
    }
};
