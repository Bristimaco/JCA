<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_schedules', function (Blueprint $table) {
            $table->boolean('is_extra')->default(false)->after('trainer_id');
            $table->date('date')->nullable()->after('is_extra');

            // Make day nullable for extra trainings (they use date instead)
            $table->string('day')->nullable()->change();

            // Make training_group_id nullable for extra trainings (they use pivot)
            $table->foreignId('training_group_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('training_schedules', function (Blueprint $table) {
            $table->dropColumn(['is_extra', 'date']);
            $table->string('day')->nullable(false)->change();
            $table->foreignId('training_group_id')->nullable(false)->change();
        });
    }
};
