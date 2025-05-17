<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('activity_type', 100);
            $table->text('activity_description');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index('user_id', 'idx_activity_user');
            $table->index('activity_type', 'idx_activity_type');
            $table->index('created_at', 'idx_activity_time');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
