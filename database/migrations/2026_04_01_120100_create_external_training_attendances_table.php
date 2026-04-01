<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('external_training_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_session_id')->constrained('training_sessions')->cascadeOnDelete();
            $table->string('name');
            $table->enum('belt_color', ['wit', 'geel', 'oranje', 'groen', 'blauw', 'bruin', 'zwart']);
            $table->foreignId('club_id')->constrained('clubs')->restrictOnDelete();
            $table->dateTime('confirmed_at');
            $table->timestamps();

            $table->unique(['training_session_id', 'name', 'club_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('external_training_attendances');
    }
};
