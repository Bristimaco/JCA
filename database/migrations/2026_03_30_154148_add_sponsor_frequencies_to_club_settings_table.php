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
            $table->unsignedInteger('sponsor_frequency_bronze')->default(60)->after('default_membership_fee');
            $table->unsignedInteger('sponsor_frequency_silver')->default(30)->after('sponsor_frequency_bronze');
            $table->unsignedInteger('sponsor_frequency_gold')->default(15)->after('sponsor_frequency_silver');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('club_settings', function (Blueprint $table) {
            $table->dropColumn(['sponsor_frequency_bronze', 'sponsor_frequency_silver', 'sponsor_frequency_gold']);
        });
    }
};
