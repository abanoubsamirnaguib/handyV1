<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('payment_type', ['deposit', 'full_payment', 'remaining_payment'])->default('full_payment');
            $table->enum('payment_method', ['cash_on_delivery', 'bank_transfer', 'credit_card'])->default('cash_on_delivery');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('transaction_id')->nullable();
            $table->text('notes')->nullable();
            
            $table->boolean('is_deposit_payment')->default(false);
            $table->decimal('remaining_amount', 10, 2)->nullable();
            
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('order_id', 'idx_payment_order');
            $table->index('status', 'idx_payment_status');
            $table->index('payment_type', 'idx_payment_type');
            $table->index('payment_method', 'idx_payment_method');
            $table->index('is_deposit_payment', 'idx_payment_deposit');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
