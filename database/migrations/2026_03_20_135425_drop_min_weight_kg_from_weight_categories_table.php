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
        Schema::table('weight_categories', function (Blueprint $table) {
            $table->dropColumn('min_weight_kg');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('weight_categories', function (Blueprint $table) {
            $table->decimal('min_weight_kg', 5, 1)->after('name');
        });
    }
};
