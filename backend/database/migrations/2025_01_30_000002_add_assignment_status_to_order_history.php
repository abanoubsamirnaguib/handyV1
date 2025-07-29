<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // إضافة حالات التعيين الجديدة إلى جدول order_history
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
            'suspended',
            'assigned_to_pickup',
            'assigned_to_delivery'
        ) DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // إرجاع enum إلى حالته السابقة
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
    }
}; 