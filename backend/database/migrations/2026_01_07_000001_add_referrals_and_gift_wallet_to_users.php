<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Gift wallet: usable for purchases only (non-withdrawable)
            $table->decimal('gift_wallet_balance', 10, 2)->default(0)->after('buyer_wallet_balance');

            // Referral system
            $table->string('referral_code', 32)->unique()->nullable()->after('gift_wallet_balance');
            $table->unsignedBigInteger('referred_by_user_id')->nullable()->after('referral_code');

            $table->index('referred_by_user_id', 'idx_users_referred_by_user_id');
            $table->foreign('referred_by_user_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['referred_by_user_id']);
            $table->dropIndex('idx_users_referred_by_user_id');
            $table->dropUnique(['referral_code']);
            $table->dropColumn(['gift_wallet_balance', 'referral_code', 'referred_by_user_id']);
        });
    }
};

