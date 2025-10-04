<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('delivery_fee', 8, 2)->default(0);
            $table->decimal('platform_commission_percent', 5, 2)->default(0); // e.g. 10.00 => 10%
            $table->timestamps();
        });

        // Add foreign keys and columns to orders
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('city_id')->nullable()->after('seller_id')->constrained('cities')->nullOnDelete();
            $table->decimal('platform_commission_percent', 5, 2)->nullable()->after('delivery_fee_status');
            $table->decimal('platform_commission_amount', 10, 2)->nullable()->after('platform_commission_percent');
            $table->decimal('buyer_total', 10, 2)->nullable()->after('platform_commission_amount');
            $table->decimal('seller_net_amount', 10, 2)->nullable()->after('buyer_total');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'city_id')) {
                $table->dropConstrainedForeignId('city_id');
            }
            $table->dropColumn([
                'platform_commission_percent',
                'platform_commission_amount',
                'buyer_total',
                'seller_net_amount',
            ]);
        });

        Schema::dropIfExists('cities');
    }
};
