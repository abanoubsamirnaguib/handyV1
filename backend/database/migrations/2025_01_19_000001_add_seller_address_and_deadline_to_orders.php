<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // إضافة حقول عنوان البائع والموعد النهائي للإنجاز
            $table->text('seller_address')->nullable()->after('seller_notes');
            $table->dateTime('completion_deadline')->nullable()->after('seller_address');
            $table->boolean('is_late')->default(false)->after('completion_deadline');
            $table->text('late_reason')->nullable()->after('is_late');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['seller_address', 'completion_deadline', 'is_late', 'late_reason']);
        });
    }
};
