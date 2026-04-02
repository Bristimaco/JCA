<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prospects', function (Blueprint $table) {
            $table->decimal('sponsor_amount', 10, 2)->nullable()->after('longitude');
            $table->date('sponsor_start_date')->nullable()->after('sponsor_amount');
            $table->integer('sponsor_renewal_months')->nullable()->after('sponsor_start_date');
            $table->string('sponsor_tier')->nullable()->after('sponsor_renewal_months');
            $table->longText('logo_data')->nullable()->after('sponsor_tier');
            $table->string('logo_mime')->nullable()->after('logo_data');
            $table->timestamp('archived_at')->nullable()->after('logo_mime');
            $table->string('archived_reason')->nullable()->after('archived_at');
        });
    }

    public function down(): void
    {
        Schema::table('prospects', function (Blueprint $table) {
            $table->dropColumn([
                'sponsor_amount',
                'sponsor_start_date',
                'sponsor_renewal_months',
                'sponsor_tier',
                'logo_data',
                'logo_mime',
                'archived_at',
                'archived_reason',
            ]);
        });
    }
};
