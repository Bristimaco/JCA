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
            $table->unsignedSmallInteger('slide_duration_results')->nullable();
            $table->unsignedSmallInteger('slide_duration_announcements')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('club_settings', function (Blueprint $table) {
            $table->dropColumn(['slide_duration_results', 'slide_duration_announcements']);
        });
    }
};
