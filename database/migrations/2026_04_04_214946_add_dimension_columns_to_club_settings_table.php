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
            $table->json('dimension_1')->nullable();
            $table->json('dimension_2')->nullable();
            $table->json('dimension_3')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('club_settings', function (Blueprint $table) {
            $table->dropColumn(['dimension_1', 'dimension_2', 'dimension_3']);
        });
    }
};
