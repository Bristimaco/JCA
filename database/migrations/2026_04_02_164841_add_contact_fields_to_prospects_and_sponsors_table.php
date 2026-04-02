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
        Schema::table('prospects', function (Blueprint $table) {
            $table->string('contact_name')->nullable()->after('website');
            $table->string('contact_phone')->nullable()->after('contact_name');
        });

        Schema::table('sponsors', function (Blueprint $table) {
            $table->string('contact_name')->nullable()->after('address_postal_code');
            $table->string('contact_phone')->nullable()->after('contact_name');
        });
    }

    public function down(): void
    {
        Schema::table('prospects', function (Blueprint $table) {
            $table->dropColumn(['contact_name', 'contact_phone']);
        });

        Schema::table('sponsors', function (Blueprint $table) {
            $table->dropColumn(['contact_name', 'contact_phone']);
        });
    }
};
