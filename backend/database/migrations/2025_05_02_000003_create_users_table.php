<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->autoIncrement();
            $table->string('email', 100)->unique();
            $table->string('password', 255);
            $table->string('name', 100);
            $table->enum('role', ['admin', 'seller', 'buyer'])->default('buyer');
            $table->enum('active_role', ['seller', 'buyer'])->default('buyer');
            $table->boolean('is_seller')->default(false);
            $table->boolean('is_buyer')->default(true);
            $table->enum('status', ['active', 'suspended'])->default('active');
            $table->string('avatar', 255)->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('bio')->nullable();
            $table->string('location', 255)->nullable();
            $table->index('location', 'idx_seller_location');
            $table->dateTime('registration_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('last_login')->nullable();
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->index('email', 'idx_user_email');
            $table->index('role', 'idx_user_role');
            $table->index('status', 'idx_user_status');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
