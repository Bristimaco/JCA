<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Copy existing members.user_id data to member_user pivot (skip duplicates)
        $members = DB::table('members')->whereNotNull('user_id')->get();

        foreach ($members as $member) {
            $exists = DB::table('member_user')
                ->where('member_id', $member->id)
                ->where('user_id', $member->user_id)
                ->exists();

            if (! $exists) {
                DB::table('member_user')->insert([
                    'member_id' => $member->id,
                    'user_id' => $member->user_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        Schema::table('members', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
        });
    }
};
