<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('club_settings', function (Blueprint $table) {
            $table->boolean('test_mode')->default(false)->after('mollie_expiry_days');
        });

        Schema::create('test_mode_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('recipient');
            $table->string('subject');
            $table->text('body')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_mode_logs');

        Schema::table('club_settings', function (Blueprint $table) {
            $table->dropColumn('test_mode');
        });
    }
};
