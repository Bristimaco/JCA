<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('membership_fee', 8, 2);
            $table->decimal('membership_fee_discount', 8, 2)->default(0);
            $table->string('training_day')->nullable();
            $table->string('training_time')->nullable();
            $table->string('location')->nullable();
            $table->foreignId('trainer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_groups');
    }
};
