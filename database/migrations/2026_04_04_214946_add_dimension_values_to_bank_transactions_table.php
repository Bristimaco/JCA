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
        Schema::table('bank_transactions', function (Blueprint $table) {
            $table->string('dimension_1_value')->nullable();
            $table->string('dimension_2_value')->nullable();
            $table->string('dimension_3_value')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('bank_transactions', function (Blueprint $table) {
            $table->dropColumn(['dimension_1_value', 'dimension_2_value', 'dimension_3_value']);
        });
    }
};
