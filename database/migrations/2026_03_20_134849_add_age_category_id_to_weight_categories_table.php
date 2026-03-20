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
        Schema::table('weight_categories', function (Blueprint $table) {
            $table->foreignId('age_category_id')->after('id')->constrained()->cascadeOnDelete();
            $table->dropColumn('age_group');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('weight_categories', function (Blueprint $table) {
            $table->dropForeign(['age_category_id']);
            $table->dropColumn('age_category_id');
            $table->string('age_group')->nullable()->after('gender');
        });
    }
};
