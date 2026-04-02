<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prospects', function (Blueprint $table) {
            $table->id();
            $table->string('vat_number')->unique();
            $table->string('company_name');
            $table->string('address_street')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_postal_code', 10)->nullable();
            $table->string('legal_form')->nullable();
            $table->string('phone')->nullable();
            $table->integer('score')->nullable();
            $table->decimal('credit_limit', 12, 2)->nullable();
            $table->json('companyweb_data')->nullable();
            $table->timestamp('companyweb_fetched_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prospects');
    }
};
