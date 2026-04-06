<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $defaults = [
            ['setting_key' => 'referral_enabled', 'setting_value' => 'true'],
            ['setting_key' => 'referral_bonus_amount', 'setting_value' => '0'],
        ];

        foreach ($defaults as $setting) {
            DB::table('site_settings')->updateOrInsert(
                ['setting_key' => $setting['setting_key']],
                [
                    'setting_value' => $setting['setting_value'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        DB::table('site_settings')->whereIn('setting_key', [
            'referral_enabled',
            'referral_bonus_amount',
        ])->delete();
    }
};

