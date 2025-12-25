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
            // حقول جديدة لدعم إنشاء البائع للطلب
            $table->boolean('is_seller_created')->default(false)->after('is_service_order');
            $table->string('delivery_time')->nullable()->after('is_seller_created');
            $table->unsignedBigInteger('conversation_id')->nullable()->after('delivery_time');
            
            // إضافة foreign key للـ conversation
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['conversation_id']);
            $table->dropColumn(['is_seller_created', 'delivery_time', 'conversation_id']);
        });
    }
};
