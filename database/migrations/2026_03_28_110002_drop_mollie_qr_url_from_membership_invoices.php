<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_invoices', function (Blueprint $table) {
            $table->dropColumn('mollie_qr_url');
        });
    }

    public function down(): void
    {
        Schema::table('membership_invoices', function (Blueprint $table) {
            $table->string('mollie_qr_url')->nullable();
        });
    }
};
