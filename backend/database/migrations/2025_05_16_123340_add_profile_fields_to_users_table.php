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
            // Add profile fields if they don't exist
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable();
            }
            
            if (!Schema::hasColumn('users', 'location')) {
                $table->string('location')->nullable();
            }
            
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable();
            }
            
            if (!Schema::hasColumn('users', 'skills')) {
                $table->json('skills')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bio', 'location', 'avatar', 'skills']);
        });
    }
};
