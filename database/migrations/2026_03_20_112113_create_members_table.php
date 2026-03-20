<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth');
            $table->string('gender');
            $table->string('nationality')->nullable();
            $table->string('national_member_id')->nullable()->unique();
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('address_street')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_postal_code', 10)->nullable();
            $table->string('address_country', 2)->default('BE');
            $table->decimal('current_weight_kg', 5, 1)->nullable();
            $table->text('medical_notes')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->string('membership_status')->default('pending');
            $table->date('membership_start_date')->nullable();
            $table->date('membership_end_date')->nullable();
            $table->boolean('photo_consent')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('membership_status');
            $table->index('date_of_birth');
            $table->index('last_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
