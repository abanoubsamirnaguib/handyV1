<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('deposit_image')->nullable()->after('deposit_notes');
            $table->boolean('is_service_order')->default(false)->after('requires_deposit');
            $table->text('service_requirements')->nullable()->after('requirements');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['deposit_image', 'is_service_order', 'service_requirements']);
        });
    }
}; 