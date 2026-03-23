<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address_street')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_postal_code', 10)->nullable();
            $table->string('country_code', 2)->default('BE');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->date('tournament_date');
            $table->date('invitation_deadline')->nullable();
            $table->date('registration_deadline')->nullable();
            $table->string('status')->default('preparation');
            $table->timestamps();

            $table->index('tournament_date');
            $table->index('status');
        });

        Schema::create('age_category_tournament', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('age_category_id')->constrained()->cascadeOnDelete();

            $table->unique(['tournament_id', 'age_category_id']);
        });

        Schema::create('tournament_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_attachments');
        Schema::dropIfExists('age_category_tournament');
        Schema::dropIfExists('tournaments');
    }
};
