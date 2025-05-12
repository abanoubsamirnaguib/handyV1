<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_history', function (Blueprint $table) {
            $table->id();
            $table->uuid('order_id');
            $table->enum('status', ['pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded']);
            $table->uuid('action_by')->nullable();
            $table->string('action_type', 100)->nullable();
            $table->text('note')->nullable();
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
            $table->foreign('action_by')->references('id')->on('users')->onDelete('set null');
            $table->index('order_id', 'idx_order_history_order');
            $table->index('status', 'idx_order_history_status');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('order_history');
    }
};
