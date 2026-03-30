<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('club_settings', function (Blueprint $table) {
            $table->decimal('default_membership_fee', 8, 2)->nullable()->after('attendance_threshold');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('club_settings', function (Blueprint $table) {
            $table->dropColumn('default_membership_fee');
        });
    }
};
