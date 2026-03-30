<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_tournament', function (Blueprint $table) {
            $table->string('mollie_payment_id')->nullable()->after('invitation_token');
            $table->string('mollie_payment_url')->nullable()->after('mollie_payment_id');
            $table->string('payment_status')->nullable()->after('mollie_payment_url');
        });
    }

    public function down(): void
    {
        Schema::table('member_tournament', function (Blueprint $table) {
            $table->dropColumn(['mollie_payment_id', 'mollie_payment_url', 'payment_status']);
        });
    }
};
