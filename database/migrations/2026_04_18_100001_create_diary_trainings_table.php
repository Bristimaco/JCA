<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diary_trainings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('training_type_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->decimal('actual_calories', 6, 1)->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'training_type_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diary_trainings');
    }
};
