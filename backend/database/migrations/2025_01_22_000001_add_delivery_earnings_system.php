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
            $table->decimal('delivery_fee', 8, 2)->default(10.00)->after('delivery_person_id');
            $table->enum('delivery_fee_status', ['pending', 'paid'])->default('pending')->after('delivery_fee');
        });        // This migration is no longer needed - delivery earnings system removed
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is no longer needed - delivery earnings system removed
    }
}; 