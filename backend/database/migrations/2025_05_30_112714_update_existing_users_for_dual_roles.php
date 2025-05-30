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
        // Update existing users to set dual role flags based on their current role
        DB::table('users')->update([
            'is_buyer' => DB::raw("CASE WHEN role = 'seller' THEN false ELSE true END"),
            'is_seller' => DB::raw("CASE WHEN role = 'seller' THEN true ELSE false END"),
            'active_role' => DB::raw("CASE WHEN role = 'admin' THEN 'buyer' ELSE role END")
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the dual role flags to null/default values
        DB::table('users')->update([
            'is_buyer' => true,
            'is_seller' => false,
            'active_role' => 'buyer'
        ]);
    }
};
