<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('age_category_tournament', function (Blueprint $table) {
            $table->decimal('entry_fee', 8, 2)->nullable()->after('age_category_id');
        });
    }

    public function down(): void
    {
        Schema::table('age_category_tournament', function (Blueprint $table) {
            $table->dropColumn('entry_fee');
        });
    }
};
