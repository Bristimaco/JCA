<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('training_groups', function (Blueprint $table) {
            $table->dropColumn(['training_day', 'training_time']);
        });
    }

    public function down(): void
    {
        Schema::table('training_groups', function (Blueprint $table) {
            $table->string('training_day')->nullable();
            $table->string('training_time')->nullable();
        });
    }
};
