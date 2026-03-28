<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_schedule_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->dateTime('opened_at');
            $table->dateTime('closed_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['training_schedule_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_sessions');
    }
};
