<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referral_rewards', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->unsignedBigInteger('referrer_user_id');
            $table->unsignedBigInteger('referred_user_id');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('referrer_user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->foreign('referred_user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            // Prevent double reward for the same referred user
            $table->unique('referred_user_id', 'uq_referral_rewards_referred_user');
            $table->index('referrer_user_id', 'idx_referral_rewards_referrer_user');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_rewards');
    }
};

