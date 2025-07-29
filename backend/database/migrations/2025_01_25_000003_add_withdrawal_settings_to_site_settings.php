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
        // Add withdrawal settings to site_settings table
        DB::table('site_settings')->insert([
            [
                'setting_key' => 'min_withdrawal_amount',
                'setting_value' => '100',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'setting_key' => 'max_withdrawal_amount', 
                'setting_value' => '100000',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('site_settings')->whereIn('setting_key', ['min_withdrawal_amount', 'max_withdrawal_amount'])->delete();
    }
}; 