<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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

        $referredUserForeignKey = $this->findForeignKeyName('referral_rewards', 'referred_user_id');

        if ($referredUserForeignKey && $this->indexExists('referral_rewards', 'uq_referral_rewards_referred_type')) {
            DB::statement("ALTER TABLE referral_rewards DROP FOREIGN KEY {$referredUserForeignKey}");
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

        if (!$this->findForeignKeyName('referral_rewards', 'referred_user_id')) {
            Schema::table('referral_rewards', function (Blueprint $table) {
                $table->foreign('referred_user_id')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            });
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

            if (!$this->findForeignKeyName('referral_rewards', 'referred_user_id')) {
                Schema::table('referral_rewards', function (Blueprint $table) {
                    $table->foreign('referred_user_id')
                        ->references('id')
                        ->on('users')
                        ->cascadeOnDelete();
                });
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

    private function findForeignKeyName(string $table, string $column): ?string
    {
        $result = DB::selectOne(
            'SELECT CONSTRAINT_NAME AS fk_name
             FROM information_schema.key_column_usage
             WHERE table_schema = DATABASE()
               AND table_name = ?
               AND column_name = ?
               AND referenced_table_name IS NOT NULL
             LIMIT 1',
            [$table, $column]
        );

        if (!$result) {
            return null;
        }

        return $result->fk_name
            ?? $result->constraint_name
            ?? $result->CONSTRAINT_NAME
            ?? null;
    }
};
