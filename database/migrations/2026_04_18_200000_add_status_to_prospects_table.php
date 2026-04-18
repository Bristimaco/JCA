<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prospects', function (Blueprint $table) {
            $table->string('status', 20)->default('inactief')->after('vat_number');
        });

        // Migrate existing data: archived prospects → gearchiveerd, rest → inactief
        DB::table('prospects')->whereNotNull('archived_at')->update(['status' => 'gearchiveerd']);

        Schema::table('prospects', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }

    public function down(): void
    {
        Schema::table('prospects', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable();
        });

        DB::table('prospects')->where('status', 'gearchiveerd')->update(['archived_at' => now()]);

        Schema::table('prospects', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
