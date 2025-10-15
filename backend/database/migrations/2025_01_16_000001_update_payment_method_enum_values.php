<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update orders table payment_method enum
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('cash_on_delivery', 'vodafone_cash', 'instapay', 'bank_transfer', 'credit_card') DEFAULT 'cash_on_delivery'");
        
        // Update payments table payment_method enum  
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash_on_delivery', 'vodafone_cash', 'instapay', 'bank_transfer', 'credit_card') DEFAULT 'cash_on_delivery'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert orders table payment_method enum to original values
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('cash_on_delivery', 'bank_transfer', 'credit_card') DEFAULT 'cash_on_delivery'");
        
        // Revert payments table payment_method enum to original values
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash_on_delivery', 'bank_transfer', 'credit_card') DEFAULT 'cash_on_delivery'");
    }
};