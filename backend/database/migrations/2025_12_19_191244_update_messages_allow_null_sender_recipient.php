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
        Schema::table('messages', function (Blueprint $table) {
            // Make sender_id and recipient_id nullable to support system messages
            $table->unsignedBigInteger('sender_id')->nullable()->change();
            $table->unsignedBigInteger('recipient_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Revert back to NOT NULL if needed
            $table->unsignedBigInteger('sender_id')->nullable(false)->change();
            $table->unsignedBigInteger('recipient_id')->nullable(false)->change();
        });
    }
};
