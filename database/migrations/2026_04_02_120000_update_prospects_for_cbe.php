<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prospects', function (Blueprint $table) {
            $table->dropColumn(['score', 'credit_limit']);
            $table->renameColumn('companyweb_data', 'cbe_data');
            $table->renameColumn('companyweb_fetched_at', 'cbe_fetched_at');
            $table->string('email')->nullable()->after('phone');
            $table->string('website')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('prospects', function (Blueprint $table) {
            $table->dropColumn(['email', 'website']);
            $table->renameColumn('cbe_data', 'companyweb_data');
            $table->renameColumn('cbe_fetched_at', 'companyweb_fetched_at');
            $table->integer('score')->nullable();
            $table->decimal('credit_limit', 12, 2)->nullable();
        });
    }
};
