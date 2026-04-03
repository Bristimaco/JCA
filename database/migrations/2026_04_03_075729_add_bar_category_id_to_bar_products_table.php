<?php

use App\Models\BarCategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $default = BarCategory::firstOrCreate(
            ['name' => 'Algemeen'],
            ['display_order' => 0],
        );

        Schema::table('bar_products', function (Blueprint $table) {
            $table->foreignId('bar_category_id')->nullable()->after('display_order')->constrained()->cascadeOnDelete();
        });

        DB::table('bar_products')->whereNull('bar_category_id')->update(['bar_category_id' => $default->id]);

        Schema::table('bar_products', function (Blueprint $table) {
            $table->foreignId('bar_category_id')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bar_products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('bar_category_id');
        });
    }
};
