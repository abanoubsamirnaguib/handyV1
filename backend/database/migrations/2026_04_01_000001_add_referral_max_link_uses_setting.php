<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('site_settings')->updateOrInsert(
            ['setting_key' => 'referral_max_link_uses'],
            [
                'setting_value' => '0',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        DB::table('site_settings')
            ->where('setting_key', 'referral_max_link_uses')
            ->delete();
    }
};
