<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration for Web Push Subscriptions table
 * 
 * This table stores user Web Push subscriptions for sending notifications
 * when the application is closed (offline notifications via Web Push API).
 * 
 * Each subscription includes:
 * - endpoint: The push service URL to send notifications to
 * - p256dh_key: The user's public encryption key
 * - auth_key: The authentication secret for message encryption
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('web_push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('endpoint'); // The push service endpoint URL
            $table->string('p256dh_key'); // User's public encryption key
            $table->string('auth_key'); // Authentication secret
            $table->string('user_agent')->nullable(); // Browser/device info
            $table->timestamp('last_used_at')->nullable(); // Track last notification sent
            $table->timestamps();
            
            // Index for faster lookups by user
            $table->index('user_id');
            // Unique constraint to prevent duplicate subscriptions
            $table->unique(['user_id', 'endpoint']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('web_push_subscriptions');
    }
};
