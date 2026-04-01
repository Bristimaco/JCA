<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_groups', function (Blueprint $table) {
            $table->boolean('allow_external_members')->default(false)->after('location');
        });
    }

    public function down(): void
    {
        Schema::table('training_groups', function (Blueprint $table) {
            $table->dropColumn('allow_external_members');
        });
    }
};
