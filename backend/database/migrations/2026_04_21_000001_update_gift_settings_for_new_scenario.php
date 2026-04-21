<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $legacyOrderGiftAmount = DB::table('site_settings')
            ->where('setting_key', 'referral_first_order_gift_amount')
            ->value('setting_value');

        $legacyReferralSellerGiftAmount = DB::table('site_settings')
            ->where('setting_key', 'referral_first_product_gift_amount')
            ->value('setting_value');

        $legacyReferralLimit = DB::table('site_settings')
            ->where('setting_key', 'referral_max_link_uses')
            ->value('setting_value');

        $settings = [
            [
                'setting_key' => 'gift_order_completed_amount',
                'setting_value' => (string) ($legacyOrderGiftAmount ?? '0'),
            ],
            [
                'setting_key' => 'gift_order_completed_limit_per_seller',
                'setting_value' => '0',
            ],
            [
                'setting_key' => 'gift_referral_seller_first_product_amount',
                'setting_value' => (string) ($legacyReferralSellerGiftAmount ?? '0'),
            ],
            [
                'setting_key' => 'gift_referral_seller_registration_limit',
                'setting_value' => (string) ($legacyReferralLimit ?? '0'),
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('site_settings')->updateOrInsert(
                ['setting_key' => $setting['setting_key']],
                [
                    'setting_value' => $setting['setting_value'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        if (!Schema::hasTable('referral_rewards')) {
            return;
        }

        if ($this->indexExists('referral_rewards', 'uq_referral_rewards_referred_type')) {
            DB::statement('ALTER TABLE referral_rewards DROP INDEX uq_referral_rewards_referred_type');
        }

        if (!$this->indexExists('referral_rewards', 'uq_referral_rewards_type_order_source')) {
            DB::statement('ALTER TABLE referral_rewards ADD UNIQUE uq_referral_rewards_type_order_source (reward_type, source_order_id)');
        }

        if (!$this->indexExists('referral_rewards', 'idx_referral_rewards_referrer_type')) {
            DB::statement('ALTER TABLE referral_rewards ADD INDEX idx_referral_rewards_referrer_type (referrer_user_id, reward_type)');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('referral_rewards')) {
            if ($this->indexExists('referral_rewards', 'uq_referral_rewards_type_order_source')) {
                DB::statement('ALTER TABLE referral_rewards DROP INDEX uq_referral_rewards_type_order_source');
            }

            if ($this->indexExists('referral_rewards', 'idx_referral_rewards_referrer_type')) {
                DB::statement('ALTER TABLE referral_rewards DROP INDEX idx_referral_rewards_referrer_type');
            }

            if (!$this->indexExists('referral_rewards', 'uq_referral_rewards_referred_type')) {
                DB::statement('ALTER TABLE referral_rewards ADD UNIQUE uq_referral_rewards_referred_type (referred_user_id, reward_type)');
            }
        }

        DB::table('site_settings')->whereIn('setting_key', [
            'gift_order_completed_amount',
            'gift_order_completed_limit_per_seller',
            'gift_referral_seller_first_product_amount',
            'gift_referral_seller_registration_limit',
        ])->delete();
    }

    private function indexExists(string $table, string $indexName): bool
    {
        return DB::table('information_schema.statistics')
            ->where('table_schema', DB::raw('DATABASE()'))
            ->where('table_name', $table)
            ->where('index_name', $indexName)
            ->exists();
    }
};
