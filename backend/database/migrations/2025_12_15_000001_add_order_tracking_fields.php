<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // تحديث الحالات لتتطابق مع المتطلبات الجديدة
            $table->dropColumn('status');
        });
        
        Schema::table('orders', function (Blueprint $table) {
            // حالات الطلب بناءً على المتطلبات
            $table->enum('status', [
                'pending',           // قيد الانتظار (بعد إنشاء الطلب)
                'admin_approved',    // موافقة السوبر ادمن
                'seller_approved',   // موافقة البائع
                'in_progress',       // جاري التنفيذ
                'ready_for_delivery', // جاهز للتوصيل
                'out_for_delivery',  // قيد التوصيل
                'delivered',         // تم التوصيل
                'completed',         // مكتمل
                'cancelled'          // ملغي
            ])->default('pending');
            
            // إضافة حقول جديدة للتتبع
            $table->string('payment_proof')->nullable(); // صورة إثبات الدفع
            $table->timestamp('admin_approved_at')->nullable(); // وقت موافقة الأدمن
            $table->unsignedBigInteger('admin_approved_by')->nullable(); // من وافق من الأدمن
            $table->timestamp('seller_approved_at')->nullable(); // وقت موافقة البائع
            $table->timestamp('work_started_at')->nullable(); // وقت بدء العمل
            $table->timestamp('work_completed_at')->nullable(); // وقت إكمال العمل
            $table->timestamp('delivery_scheduled_at')->nullable(); // موعد تسليم للدليفري
            $table->timestamp('delivery_picked_up_at')->nullable(); // وقت استلام الدليفري
            $table->timestamp('delivered_at')->nullable(); // وقت التسليم النهائي
            $table->timestamp('completed_at')->nullable(); // وقت إكمال الطلب
            
            // معلومات الدليفري
            $table->unsignedBigInteger('delivery_person_id')->nullable(); // ID الدليفري
            $table->text('delivery_notes')->nullable(); // ملاحظات التوصيل
            $table->text('admin_notes')->nullable(); // ملاحظات الأدمن
            $table->text('seller_notes')->nullable(); // ملاحظات البائع
            
            // إضافة فهارس جديدة
            $table->index('admin_approved_by');
            $table->index('delivery_person_id');
            $table->index('admin_approved_at');
            $table->index('delivered_at');
            
            // Foreign keys
            $table->foreign('admin_approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('delivery_person_id')->references('id')->on('delivery_personnel')->onDelete('set null');
        });

        Schema::table('order_history', function (Blueprint $table) {
            // تحديث الحالات لتتطابق مع المتطلبات الجديدة
            $table->dropColumn('status');
        });
        Schema::table('order_history', function (Blueprint $table) {
            $table->enum('status', [
                'pending',            // قيد الانتظار (بعد إنشاء الطلب)
                'admin_approved',     // موافقة السوبر ادمن
                'seller_approved',    // موافقة البائع
                'in_progress',        // جاري التنفيذ
                'ready_for_delivery', // جاهز للتوصيل
                'out_for_delivery',   // قيد التوصيل
                'delivered',          // تم التوصيل
                'completed',          // مكتمل
                'cancelled',          // ملغى
                'paid',               // مدفوع
                'refunded'            // مسترجع
            ])->default('pending');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['admin_approved_by']);
            $table->dropForeign(['delivery_person_id']);
            
            $table->dropColumn([
                'payment_proof',
                'admin_approved_at',
                'admin_approved_by', 
                'seller_approved_at',
                'work_started_at',
                'work_completed_at',
                'delivery_scheduled_at',
                'delivery_picked_up_at',
                'delivered_at',
                'completed_at',
                'delivery_person_id',
                'delivery_notes',
                'admin_notes',
                'seller_notes'
            ]);
            
            $table->dropColumn('status');
        });
        
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['pending', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded'])->default('pending');
        });
        Schema::table('order_history', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
}; 