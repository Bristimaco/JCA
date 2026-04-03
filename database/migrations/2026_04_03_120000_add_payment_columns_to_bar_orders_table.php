<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bar_orders', function (Blueprint $table) {
            $table->string('mollie_payment_id')->nullable()->after('user_id');
            $table->string('mollie_payment_url')->nullable()->after('mollie_payment_id');
            $table->string('payment_method')->nullable()->after('mollie_payment_url');
            $table->string('payment_status')->nullable()->after('payment_method');
            $table->timestamp('paid_at')->nullable()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('bar_orders', function (Blueprint $table) {
            $table->dropColumn([
                'mollie_payment_id',
                'mollie_payment_url',
                'payment_method',
                'payment_status',
                'paid_at',
            ]);
        });
    }
};
