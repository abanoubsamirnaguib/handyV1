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
        Schema::table('orders', function (Blueprint $table) {
            // إضافة حقل منفصل لموظف الاستلام (الحقل الحالي delivery_person_id سيكون للتسليم)
            $table->unsignedBigInteger('pickup_person_id')->nullable()->after('delivery_person_id');
            
            // ملاحظات منفصلة للاستلام (الحقل الحالي delivery_notes سيكون للتسليم)
            $table->text('pickup_notes')->nullable()->after('delivery_notes');
            
            // فهرس
            $table->index('pickup_person_id');
            
            // Foreign key
            $table->foreign('pickup_person_id')->references('id')->on('delivery_personnel')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['pickup_person_id']);
            $table->dropColumn(['pickup_person_id', 'pickup_notes']);
        });
    }
}; 