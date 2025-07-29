<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // تحديث جدول orders لإضافة حالة "suspended"
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
            'pending',
            'admin_approved', 
            'seller_approved',
            'in_progress',
            'ready_for_delivery',
            'out_for_delivery',
            'delivered',
            'completed',
            'cancelled',
            'suspended'
        ) DEFAULT 'pending'");

        // تحديث جدول order_history لإضافة حالة "suspended"
        DB::statement("ALTER TABLE order_history MODIFY COLUMN status ENUM(
            'pending',
            'admin_approved',
            'seller_approved', 
            'in_progress',
            'ready_for_delivery',
            'out_for_delivery',
            'delivered',
            'completed',
            'cancelled',
            'paid',
            'refunded',
            'suspended'
        ) DEFAULT 'pending'");

        // إضافة حقول جديدة لتتبع التعليق
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('suspended_at')->nullable()->after('delivered_at');
            $table->text('suspension_reason')->nullable()->after('delivery_notes');
            $table->index('suspended_at');
        });
    }

    public function down(): void
    {
        // إزالة الحقول المضافة
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['suspended_at']);
            $table->dropColumn(['suspended_at', 'suspension_reason']);
        });

        // إرجاع حالات orders إلى ما كانت عليه
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
            'pending',
            'admin_approved', 
            'seller_approved',
            'in_progress',
            'ready_for_delivery',
            'out_for_delivery',
            'delivered',
            'completed',
            'cancelled'
        ) DEFAULT 'pending'");

        // إرجاع حالات order_history إلى ما كانت عليه  
        DB::statement("ALTER TABLE order_history MODIFY COLUMN status ENUM(
            'pending',
            'admin_approved',
            'seller_approved',
            'in_progress', 
            'ready_for_delivery',
            'out_for_delivery',
            'delivered',
            'completed',
            'cancelled',
            'paid',
            'refunded'
        ) DEFAULT 'pending'");
    }
};
