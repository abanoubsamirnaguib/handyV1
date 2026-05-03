<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('discount_type', 20)->default('none')->after('quantity');
            $table->decimal('discount_percentage', 5, 2)->nullable()->after('discount_type');
            $table->decimal('discount_fixed_amount', 10, 2)->nullable()->after('discount_percentage');
            $table->string('discount_schedule', 20)->default('always')->after('discount_fixed_amount');
            $table->dateTime('discount_starts_at')->nullable()->after('discount_schedule');
            $table->dateTime('discount_ends_at')->nullable()->after('discount_starts_at');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'discount_type',
                'discount_percentage',
                'discount_fixed_amount',
                'discount_schedule',
                'discount_starts_at',
                'discount_ends_at',
            ]);
        });
    }
};
