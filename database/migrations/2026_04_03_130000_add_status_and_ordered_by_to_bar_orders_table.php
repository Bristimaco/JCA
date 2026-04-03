<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bar_orders', function (Blueprint $table) {
            $table->string('status')->default('pending')->after('total');
            $table->foreignId('ordered_by_user_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bar_orders', function (Blueprint $table) {
            $table->dropForeign(['ordered_by_user_id']);
            $table->dropColumn(['status', 'ordered_by_user_id']);
        });
    }
};
