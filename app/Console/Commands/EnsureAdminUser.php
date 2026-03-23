<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Console\Command;

class EnsureAdminUser extends Command
{
    protected $signature = 'admin:ensure';

    protected $description = 'Ensure the admin user exists and is verified';

    public function handle(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'admin@jca.be'],
            [
                'name' => 'Admin',
                'password' => 'Admin2026!',
            ]
        );

        $user->forceFill([
            'email_verified_at' => $user->email_verified_at ?? now(),
            'role' => UserRole::Admin,
            'is_active' => true,
        ])->save();

        $this->info('Admin user ensured: admin@jca.be');
    }
}
