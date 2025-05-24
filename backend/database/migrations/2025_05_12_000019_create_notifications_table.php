<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('notification_type', 100);
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->string('link', 255)->nullable();
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('user_id', 'idx_notification_user');
            $table->index('is_read', 'idx_notification_read');
            $table->index('created_at', 'idx_notification_time');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
