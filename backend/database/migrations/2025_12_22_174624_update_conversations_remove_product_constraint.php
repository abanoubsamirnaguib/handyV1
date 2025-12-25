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
        // Drop the product-based unique constraint if exists
        try {
            DB::statement('ALTER TABLE conversations DROP INDEX unique_buyer_seller_product');
        } catch (\Exception $e) {
            // Constraint doesn't exist, that's ok
        }
        
        // Add back the simple buyer-seller constraint
        try {
            Schema::table('conversations', function (Blueprint $table) {
                $table->unique(['buyer_id', 'seller_id'], 'unique_buyer_seller');
            });
        } catch (\Exception $e) {
            // Constraint might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop simple constraint
        try {
            Schema::table('conversations', function (Blueprint $table) {
                $table->dropUnique('unique_buyer_seller');
            });
        } catch (\Exception $e) {
            // Constraint might not exist
        }
        
        // Add back product constraint
        try {
            Schema::table('conversations', function (Blueprint $table) {
                $table->unique(['buyer_id', 'seller_id', 'product_id'], 'unique_buyer_seller_product');
            });
        } catch (\Exception $e) {
            // Constraint might not exist
        }
    }
};
