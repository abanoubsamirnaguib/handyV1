<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // حذف الحقول المتعلقة بالسناريو القديم (المشتري يعرض سعر)
            $table->dropColumn([
                'buyer_proposed_price',
                'price_approval_status', 
                'price_approved_at',
                'price_approval_notes'
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // إعادة إنشاء الحقول في حالة التراجع
            $table->decimal('buyer_proposed_price', 10, 2)->nullable()->after('total_price');
            $table->enum('price_approval_status', ['pending_approval', 'approved', 'rejected'])
                  ->nullable()
                  ->after('buyer_proposed_price');
            $table->dateTime('price_approved_at')->nullable()->after('price_approval_status');
            $table->text('price_approval_notes')->nullable()->after('price_approved_at');
        });
    }
};