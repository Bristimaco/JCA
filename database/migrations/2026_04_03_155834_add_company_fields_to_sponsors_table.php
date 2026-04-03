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
        Schema::table('sponsors', function (Blueprint $table) {
            $table->string('vat_number', 20)->nullable()->unique()->after('name');
            $table->string('phone', 50)->nullable()->after('address_postal_code');
            $table->string('email', 255)->nullable()->after('phone');
            $table->string('website', 255)->nullable()->after('email');
            $table->string('legal_form', 100)->nullable()->after('website');
            $table->float('latitude')->nullable()->after('legal_form');
            $table->float('longitude')->nullable()->after('latitude');
            $table->json('cbe_data')->nullable()->after('logo_mime');
            $table->timestamp('cbe_fetched_at')->nullable()->after('cbe_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sponsors', function (Blueprint $table) {
            $table->dropColumn([
                'vat_number', 'phone', 'email', 'website', 'legal_form',
                'latitude', 'longitude', 'cbe_data', 'cbe_fetched_at',
            ]);
        });
    }
};
