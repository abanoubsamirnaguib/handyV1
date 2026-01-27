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
        // If a previous failed migration attempt left the table behind,
        // drop it so we can re-run safely.
        Schema::dropIfExists('push_subscriptions');

        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Web Push subscription fields
            $table->text('endpoint');
            // MySQL can't make a UNIQUE index on TEXT without a prefix length,
            // so we use a fixed-length hash for indexing.
            $table->char('endpoint_hash', 64);
            $table->text('public_key'); // keys.p256dh
            $table->text('auth_token'); // keys.auth
            $table->string('content_encoding')->default('aesgcm');
            $table->unsignedBigInteger('expiration_time')->nullable();

            // Helpful metadata
            $table->string('user_agent')->nullable();
            $table->timestamp('last_used_at')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'endpoint_hash']);
            $table->index('endpoint_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};

