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
        Schema::create('nutrition_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('min_calories', 6, 1);
            $table->decimal('max_calories', 6, 1);
            $table->decimal('min_protein', 6, 1);
            $table->decimal('max_protein', 6, 1);
            $table->decimal('min_carbohydrates', 6, 1);
            $table->decimal('max_carbohydrates', 6, 1);
            $table->decimal('min_fats', 6, 1);
            $table->decimal('max_fats', 6, 1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nutrition_plans');
    }
};
