<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_personnel', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->boolean('is_available')->default(true); // متاح للعمل أم لا
            $table->string('status')->default('active'); // active, inactive, suspended
            $table->text('notes')->nullable(); // ملاحظات الإدارة
            $table->unsignedBigInteger('created_by'); // من أنشأ الحساب
            $table->timestamp('last_login_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
            
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->index(['status', 'is_available']);
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_personnel');
    }
}; 