<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->date('membership_renewal_date')->nullable()->after('membership_end_date');
            $table->timestamp('membership_fee_reminded_at')->nullable()->after('membership_renewal_date');
        });

        // Set default for existing members: 1 year from now
        DB::table('members')->whereNull('membership_renewal_date')->update([
            'membership_renewal_date' => now()->addYear()->toDateString(),
        ]);

        Schema::table('members', function (Blueprint $table) {
            $table->date('membership_renewal_date')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['membership_renewal_date', 'membership_fee_reminded_at']);
        });
    }
};
