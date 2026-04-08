<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address_street')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_postal_code')->nullable();
            $table->string('country_code', 2)->default('BE');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->date('invitation_deadline')->nullable();
            $table->date('registration_deadline')->nullable();
            $table->string('status')->default('preparation');
            $table->timestamps();

            $table->index('start_date');
            $table->index('end_date');
            $table->index('status');
        });

        Schema::create('age_category_stage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained()->cascadeOnDelete();
            $table->foreignId('age_category_id')->constrained()->cascadeOnDelete();
            $table->decimal('entry_fee', 8, 2)->nullable();
            $table->unique(['stage_id', 'age_category_id']);
        });

        Schema::create('stage_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained()->cascadeOnDelete();
            $table->string('file_path')->nullable();
            $table->longText('file_data')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('original_name');
            $table->timestamps();
        });

        Schema::create('member_stage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->string('invitation_status')->default('pending');
            $table->string('registration_status')->nullable();
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->string('invitation_token', 64)->nullable()->unique();
            $table->string('mollie_payment_id')->nullable();
            $table->string('mollie_payment_url')->nullable();
            $table->string('payment_status')->nullable();
            $table->timestamps();

            $table->unique(['stage_id', 'member_id']);
            $table->index('invitation_status');
        });

        Schema::create('stage_coaches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['stage_id', 'member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stage_coaches');
        Schema::dropIfExists('member_stage');
        Schema::dropIfExists('stage_attachments');
        Schema::dropIfExists('age_category_stage');
        Schema::dropIfExists('stages');
    }
};
