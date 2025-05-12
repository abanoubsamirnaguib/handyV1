<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('seller_id');
            $table->enum('status', ['pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded'])->default('pending');
            $table->decimal('total_price', 10, 2);
            $table->dateTime('order_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('delivery_date')->nullable();
            $table->text('requirements')->nullable();
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('seller_id')->references('id')->on('sellers')->onDelete('cascade');
            $table->index('user_id', 'idx_order_user');
            $table->index('seller_id', 'idx_order_seller');
            $table->index('status', 'idx_order_status');
            $table->index('order_date', 'idx_order_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
