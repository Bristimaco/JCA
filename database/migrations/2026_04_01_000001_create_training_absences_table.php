<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->foreignId('training_schedule_id')->constrained('training_schedules')->onDelete('cascade');
            $table->date('date');
            $table->string('reason')->nullable();
            $table->timestamps();
            $table->unique(['member_id', 'training_schedule_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_absences');
    }
};
