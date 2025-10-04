<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // حقل واحد فقط لحفظ صورة إثبات دفع باقي المبلغ
            // نستخدم الحقول الموجودة: payment_status, admin_approved_at, admin_approved_by, admin_notes
            $table->string('remaining_payment_proof')->nullable()->after('deposit_image');
            $table->string('previous_status')->nullable()->after('remaining_payment_proof');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('remaining_payment_proof');
            // التحقق من وجود العمود قبل الحذف
            if (Schema::hasColumn('orders', 'previous_status')) {
                $table->dropColumn('previous_status');
            }
        });
    }
};