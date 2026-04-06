<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('referral_rewards')) {
            return;
        }

        Schema::table('referral_rewards', function (Blueprint $table) {
            if (!Schema::hasColumn('referral_rewards', 'reward_type')) {
                $table->string('reward_type', 32)->default('signup')->after('referred_user_id');
            }

            if (!Schema::hasColumn('referral_rewards', 'source_product_id')) {
                $table->unsignedBigInteger('source_product_id')->nullable()->after('currency');
            }

            if (!Schema::hasColumn('referral_rewards', 'source_order_id')) {
                $table->unsignedBigInteger('source_order_id')->nullable()->after('source_product_id');
            }

            if (!Schema::hasColumn('referral_rewards', 'reason')) {
                $table->string('reason', 255)->nullable()->after('source_order_id');
            }
        });

        $foreignKeyName = $this->findForeignKeyName('referral_rewards', 'referred_user_id');
        if ($foreignKeyName) {
            DB::statement("ALTER TABLE referral_rewards DROP FOREIGN KEY {$foreignKeyName}");
        }

        if ($this->indexExists('referral_rewards', 'uq_referral_rewards_referred_user')) {
            DB::statement('ALTER TABLE referral_rewards DROP INDEX uq_referral_rewards_referred_user');
        }

        if (!$this->indexExists('referral_rewards', 'uq_referral_rewards_referred_type')) {
            DB::statement('ALTER TABLE referral_rewards ADD UNIQUE uq_referral_rewards_referred_type (referred_user_id, reward_type)');
        }

        if (!$this->indexExists('referral_rewards', 'idx_referral_rewards_type')) {
            DB::statement('ALTER TABLE referral_rewards ADD INDEX idx_referral_rewards_type (reward_type)');
        }

        if (!$this->indexExists('referral_rewards', 'idx_referral_rewards_source_product')) {
            DB::statement('ALTER TABLE referral_rewards ADD INDEX idx_referral_rewards_source_product (source_product_id)');
        }

        if (!$this->indexExists('referral_rewards', 'idx_referral_rewards_source_order')) {
            DB::statement('ALTER TABLE referral_rewards ADD INDEX idx_referral_rewards_source_order (source_order_id)');
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
        if (!Schema::hasTable('referral_rewards')) {
            return;
        }

        $foreignKeyName = $this->findForeignKeyName('referral_rewards', 'referred_user_id');
        if ($foreignKeyName) {
            DB::statement("ALTER TABLE referral_rewards DROP FOREIGN KEY {$foreignKeyName}");
        }

        if ($this->indexExists('referral_rewards', 'uq_referral_rewards_referred_type')) {
            DB::statement('ALTER TABLE referral_rewards DROP INDEX uq_referral_rewards_referred_type');
        }

        if ($this->indexExists('referral_rewards', 'idx_referral_rewards_type')) {
            DB::statement('ALTER TABLE referral_rewards DROP INDEX idx_referral_rewards_type');
        }

        if ($this->indexExists('referral_rewards', 'idx_referral_rewards_source_product')) {
            DB::statement('ALTER TABLE referral_rewards DROP INDEX idx_referral_rewards_source_product');
        }

        if ($this->indexExists('referral_rewards', 'idx_referral_rewards_source_order')) {
            DB::statement('ALTER TABLE referral_rewards DROP INDEX idx_referral_rewards_source_order');
        }

        Schema::table('referral_rewards', function (Blueprint $table) {
            $dropColumns = [];

            if (Schema::hasColumn('referral_rewards', 'reward_type')) {
                $dropColumns[] = 'reward_type';
            }

            if (Schema::hasColumn('referral_rewards', 'source_product_id')) {
                $dropColumns[] = 'source_product_id';
            }

            if (Schema::hasColumn('referral_rewards', 'source_order_id')) {
                $dropColumns[] = 'source_order_id';
            }

            if (Schema::hasColumn('referral_rewards', 'reason')) {
                $dropColumns[] = 'reason';
            }

            if (!empty($dropColumns)) {
                $table->dropColumn($dropColumns);
            }
        });

        if (!$this->indexExists('referral_rewards', 'uq_referral_rewards_referred_user')) {
            DB::statement('ALTER TABLE referral_rewards ADD UNIQUE uq_referral_rewards_referred_user (referred_user_id)');
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
