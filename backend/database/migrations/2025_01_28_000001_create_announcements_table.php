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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->string('image')->nullable(); // صورة الإعلان
            $table->enum('type', ['info', 'warning', 'success', 'error'])->default('info'); // نوع الإعلان
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium'); // أولوية الإعلان
            $table->boolean('is_active')->default(true); // حالة الإعلان (نشط/غير نشط)
            $table->datetime('starts_at')->nullable(); // تاريخ بداية ظهور الإعلان
            $table->datetime('ends_at')->nullable(); // تاريخ انتهاء ظهور الإعلان
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // من أنشأ الإعلان
            $table->timestamps();
            
            // فهارس لتحسين الأداء
            $table->index(['is_active', 'starts_at', 'ends_at']);
            $table->index('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
}; 