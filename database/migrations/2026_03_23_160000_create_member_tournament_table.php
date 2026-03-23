<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('member_tournament', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->string('invitation_status')->default('pending');
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->string('invitation_token', 64)->nullable()->unique();
            $table->timestamps();

            $table->unique(['tournament_id', 'member_id']);
            $table->index('invitation_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_tournament');
    }
};
