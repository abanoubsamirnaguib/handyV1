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
        Schema::table('users', function (Blueprint $table) {
            // Add active_role field to track which role is currently active
            $table->enum('active_role', ['seller', 'buyer'])->default('buyer')->after('role');
            // Add is_seller and is_buyer boolean fields for dual role support
            $table->boolean('is_seller')->default(false)->after('active_role');
            $table->boolean('is_buyer')->default(true)->after('is_seller');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['active_role', 'is_seller', 'is_buyer']);
        });
    }
};
