<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('member_tournament') || Schema::hasColumn('member_tournament', 'registration_status')) {
            return;
        }

        Schema::table('member_tournament', function (Blueprint $table) {
            $table->string('registration_status')->nullable()->after('invitation_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_tournament', function (Blueprint $table) {
            $table->dropColumn('registration_status');
        });
    }
};
