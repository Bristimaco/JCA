<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('account_number', 34); // IBAN
            $table->string('account_name')->nullable();
            $table->date('transaction_date');
            $table->date('valuta_date')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('counterparty_name')->nullable();
            $table->string('counterparty_account', 34)->nullable();
            $table->text('message')->nullable();
            $table->string('structured_message', 50)->nullable();
            $table->integer('statement_sequence')->nullable();
            $table->integer('transaction_sequence')->nullable();
            $table->string('coda_filename');
            $table->timestamps();

            $table->index('account_number');
            $table->index('transaction_date');
            $table->index('coda_filename');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_transactions');
    }
};
