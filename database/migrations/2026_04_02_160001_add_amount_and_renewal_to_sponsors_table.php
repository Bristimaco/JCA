<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sponsors', function (Blueprint $table) {
            $table->decimal('sponsor_amount', 10, 2)->nullable()->after('is_active');
            $table->integer('renewal_months')->nullable()->after('sponsor_amount');
        });
    }

    public function down(): void
    {
        Schema::table('sponsors', function (Blueprint $table) {
            $table->dropColumn(['sponsor_amount', 'renewal_months']);
        });
    }
};
