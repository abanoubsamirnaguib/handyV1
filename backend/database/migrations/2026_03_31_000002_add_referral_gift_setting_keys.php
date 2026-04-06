<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $legacySignupAmount = DB::table('site_settings')
            ->where('setting_key', 'referral_bonus_amount')
            ->value('setting_value');

        $defaults = [
            [
                'setting_key' => 'referral_signup_gift_amount',
                'setting_value' => $legacySignupAmount ?? '0',
            ],
            [
                'setting_key' => 'referral_first_product_gift_amount',
                'setting_value' => '0',
            ],
            [
                'setting_key' => 'referral_first_order_gift_amount',
                'setting_value' => '0',
            ],
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
            'referral_signup_gift_amount',
            'referral_first_product_gift_amount',
            'referral_first_order_gift_amount',
        ])->delete();
    }
};
