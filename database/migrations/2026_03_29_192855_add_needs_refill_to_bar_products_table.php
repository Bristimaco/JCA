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
        Schema::table('bar_products', function (Blueprint $table) {
            $table->boolean('needs_refill')->default(false)->after('display_order');
            $table->timestamp('needs_refill_at')->nullable()->after('needs_refill');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bar_products', function (Blueprint $table) {
            $table->dropColumn(['needs_refill', 'needs_refill_at']);
        });
    }
};
