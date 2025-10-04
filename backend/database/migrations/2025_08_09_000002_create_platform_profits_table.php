<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_profits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete();
            $table->foreignId('seller_id')->nullable()->constrained('sellers')->nullOnDelete();
            $table->decimal('amount', 10, 2);
            $table->decimal('commission_percent', 5, 2)->nullable();
            $table->timestamp('calculated_on');
            $table->timestamps();

            $table->index(['order_id']);
            $table->index(['city_id']);
            $table->index(['seller_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_profits');
    }
};
