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
        Schema::table('bank_transactions', function (Blueprint $table) {
            $table->longText('document_data')->nullable()->after('coda_filename');
            $table->string('document_mime')->nullable()->after('document_data');
            $table->string('document_name')->nullable()->after('document_mime');
        });
    }

    public function down(): void
    {
        Schema::table('bank_transactions', function (Blueprint $table) {
            $table->dropColumn(['document_data', 'document_mime', 'document_name']);
        });
    }
};
