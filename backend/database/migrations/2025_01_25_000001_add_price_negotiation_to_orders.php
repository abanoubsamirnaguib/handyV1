<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // السعر المقترح من المشتري
            $table->decimal('buyer_proposed_price', 10, 2)->nullable()->after('total_price');
            
            // السعر الأصلي للخدمة (للمرجعية)
            $table->decimal('original_service_price', 10, 2)->nullable()->after('buyer_proposed_price');
            
            // حالة الموافقة على السعر
            $table->enum('price_approval_status', ['pending_approval', 'approved', 'rejected'])
                  ->nullable()
                  ->after('original_service_price');
            
            // تاريخ موافقة/رفض البائع على السعر
            $table->dateTime('price_approved_at')->nullable()->after('price_approval_status');
            
            // ملاحظات البائع على السعر المقترح
            $table->text('price_approval_notes')->nullable()->after('price_approved_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'buyer_proposed_price',
                'original_service_price',
                'price_approval_status',
                'price_approved_at',
                'price_approval_notes'
            ]);
        });
    }
};

