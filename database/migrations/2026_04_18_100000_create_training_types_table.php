<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_default')->default(false);
            $table->decimal('surplus_calories', 6, 1)->default(0);
            $table->decimal('surplus_protein', 6, 1)->nullable();
            $table->decimal('surplus_carbohydrates', 6, 1)->nullable();
            $table->decimal('surplus_fats', 6, 1)->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_types');
    }
};
