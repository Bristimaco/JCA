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
            $table->foreignId('weight_category_id')->nullable()->after('gender')->constrained()->nullOnDelete();
            $table->dropColumn('current_weight_kg');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->decimal('current_weight_kg', 5, 1)->nullable()->after('gender');
            $table->dropForeign(['weight_category_id']);
            $table->dropColumn('weight_category_id');
        });
    }
};
