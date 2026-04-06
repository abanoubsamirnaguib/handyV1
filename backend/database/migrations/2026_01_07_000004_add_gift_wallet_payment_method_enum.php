<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add gift_wallet as a payment method option
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('cash_on_delivery', 'vodafone_cash', 'instapay', 'bank_transfer', 'credit_card', 'gift_wallet') DEFAULT 'cash_on_delivery'");
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash_on_delivery', 'vodafone_cash', 'instapay', 'bank_transfer', 'credit_card', 'gift_wallet') DEFAULT 'cash_on_delivery'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('cash_on_delivery', 'vodafone_cash', 'instapay', 'bank_transfer', 'credit_card') DEFAULT 'cash_on_delivery'");
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash_on_delivery', 'vodafone_cash', 'instapay', 'bank_transfer', 'credit_card') DEFAULT 'cash_on_delivery'");
    }
};

