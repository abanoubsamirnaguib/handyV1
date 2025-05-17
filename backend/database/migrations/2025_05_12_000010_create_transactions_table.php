<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('user_id');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 50);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->dateTime('transaction_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->json('transaction_data')->nullable();
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('order_id', 'idx_transaction_order');
            $table->index('user_id', 'idx_transaction_user');
            $table->index('status', 'idx_transaction_status');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
