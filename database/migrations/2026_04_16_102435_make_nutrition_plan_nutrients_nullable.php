<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('nutrition_plans', function (Blueprint $table) {
            $table->decimal('min_protein', 6, 1)->nullable()->change();
            $table->decimal('max_protein', 6, 1)->nullable()->change();
            $table->decimal('min_carbohydrates', 6, 1)->nullable()->change();
            $table->decimal('max_carbohydrates', 6, 1)->nullable()->change();
            $table->decimal('min_fats', 6, 1)->nullable()->change();
            $table->decimal('max_fats', 6, 1)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('nutrition_plans', function (Blueprint $table) {
            $table->decimal('min_protein', 6, 1)->nullable(false)->change();
            $table->decimal('max_protein', 6, 1)->nullable(false)->change();
            $table->decimal('min_carbohydrates', 6, 1)->nullable(false)->change();
            $table->decimal('max_carbohydrates', 6, 1)->nullable(false)->change();
            $table->decimal('min_fats', 6, 1)->nullable(false)->change();
            $table->decimal('max_fats', 6, 1)->nullable(false)->change();
        });
    }
};
