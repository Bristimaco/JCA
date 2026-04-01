<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('extra_schedule_training_group', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('training_group_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['training_schedule_id', 'training_group_id'], 'extra_schedule_group_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('extra_schedule_training_group');
    }
};
