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
        // إضافة حقل رسوم الدليفري للطلبات
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('delivery_fee', 8, 2)->default(10.00)->after('delivery_person_id');
            $table->enum('delivery_fee_status', ['pending', 'paid'])->default('pending')->after('delivery_fee');
        });

        // إنشاء جدول أرباح الدليفري
        Schema::create('delivery_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_person_id')->constrained('delivery_personnel')->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['pickup', 'delivery']); // نوع العملية: استلام أو تسليم
            $table->decimal('amount', 8, 2)->default(10.00); // المبلغ المكتسب
            $table->enum('status', ['pending', 'paid'])->default('pending'); // حالة الدفع
            $table->timestamp('earned_at'); // تاريخ اكتساب الربح
            $table->timestamp('paid_at')->nullable(); // تاريخ الدفع
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();

            // فهارس للبحث السريع
            $table->index(['delivery_person_id', 'status']);
            $table->index(['order_id']);
            $table->index(['type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_earnings');
        
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_fee', 'delivery_fee_status']);
        });
    }
}; 