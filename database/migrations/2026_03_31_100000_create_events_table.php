<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('address_street')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_postal_code', 10)->nullable();
            $table->date('event_date');
            $table->time('event_time')->nullable();
            $table->longText('image_data')->nullable();
            $table->string('image_mime')->nullable();
            $table->decimal('price_adult', 8, 2)->default(0);
            $table->decimal('price_child', 8, 2)->default(0);
            $table->string('status')->default('draft')->index();
            $table->timestamps();
        });

        Schema::create('event_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('adult_count')->default(0);
            $table->unsignedInteger('child_count')->default(0);
            $table->decimal('total_amount', 8, 2)->default(0);
            $table->string('mollie_payment_id')->nullable();
            $table->string('mollie_payment_url')->nullable();
            $table->string('payment_status')->default('pending');
            $table->string('rsvp_token', 64)->unique();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_registrations');
        Schema::dropIfExists('events');
    }
};
