<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereJsonContains('extra_modules', 'logs')
            ->get(['id', 'extra_modules'])
            ->each(function ($user) {
                $modules = json_decode($user->extra_modules, true) ?? [];
                $modules = array_values(array_unique(
                    array_merge(
                        array_filter($modules, fn ($m) => $m !== 'logs'),
                        ['admin']
                    )
                ));

                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['extra_modules' => json_encode($modules)]);
            });
    }

    public function down(): void
    {
        // Not reversible — 'logs' module no longer exists
    }
};
