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
        Schema::table('food_product_user', function (Blueprint $table) {
            $table->decimal('default_portion', 6, 1)->default(100)->after('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('food_product_user', function (Blueprint $table) {
            $table->dropColumn('default_portion');
        });
    }
};
