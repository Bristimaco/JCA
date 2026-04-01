<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_schedules', function (Blueprint $table) {
            $table->foreignId('trainer_id')->nullable()->constrained('users')->nullOnDelete();
        });

        // Copy trainer_id from each group to its schedules
        DB::statement('
            UPDATE training_schedules
            SET trainer_id = (
                SELECT training_groups.trainer_id
                FROM training_groups
                WHERE training_groups.id = training_schedules.training_group_id
            )
            WHERE EXISTS (
                SELECT 1 FROM training_groups
                WHERE training_groups.id = training_schedules.training_group_id
                AND training_groups.trainer_id IS NOT NULL
            )
        ');

        Schema::table('training_groups', function (Blueprint $table) {
            $table->dropConstrainedForeignId('trainer_id');
        });
    }

    public function down(): void
    {
        Schema::table('training_groups', function (Blueprint $table) {
            $table->foreignId('trainer_id')->nullable()->constrained('users')->nullOnDelete();
        });

        Schema::table('training_schedules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('trainer_id');
        });
    }
};
