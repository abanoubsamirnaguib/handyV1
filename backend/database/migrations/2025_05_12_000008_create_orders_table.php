<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('seller_id');
            $table->enum('status', ['pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded'])->default('pending');
            $table->decimal('total_price', 10, 2);
            $table->dateTime('order_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('delivery_date')->nullable();
            $table->text('requirements')->nullable();
            $table->string('customer_name', 100)->nullable();
            $table->string('customer_phone', 20)->nullable();
            $table->text('delivery_address')->nullable();
            
            $table->enum('payment_method', ['cash_on_delivery', 'bank_transfer', 'credit_card'])->default('cash_on_delivery');
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'refunded'])->default('pending');
            
            $table->boolean('requires_deposit')->default(false);
            $table->decimal('deposit_amount', 10, 2)->nullable();
            $table->enum('deposit_status', ['not_paid', 'paid', 'refunded'])->default('not_paid');
            $table->text('deposit_notes')->nullable();
            
            $table->unsignedBigInteger('chat_conversation_id')->nullable();
            
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('seller_id')->references('id')->on('sellers')->onDelete('cascade');
            $table->index('user_id', 'idx_order_user');
            $table->index('seller_id', 'idx_order_seller');
            $table->index('status', 'idx_order_status');
            $table->index('order_date', 'idx_order_date');
            $table->index('payment_status', 'idx_order_payment_status');
            $table->index('deposit_status', 'idx_order_deposit_status');
        });
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Schema::dropIfExists('orders');
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};
