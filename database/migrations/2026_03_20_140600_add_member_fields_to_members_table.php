<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('license_number')->nullable()->unique()->after('national_member_id');
            $table->string('photo_path')->nullable()->after('address_country');
            $table->boolean('is_competition')->default(false)->after('photo_consent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['license_number', 'photo_path', 'is_competition']);
        });
    }
};
