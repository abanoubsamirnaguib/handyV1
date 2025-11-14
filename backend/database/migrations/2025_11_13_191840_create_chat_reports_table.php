<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chat_reports', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('conversation_id');
            $table->unsignedBigInteger('reporter_id'); // User who reported
            $table->text('reason'); // Reason for reporting
            $table->text('description')->nullable(); // Additional details
            $table->enum('status', ['pending', 'resolved', 'dismissed'])->default('pending');
            $table->unsignedBigInteger('resolved_by')->nullable(); // Admin who resolved
            $table->dateTime('resolved_at')->nullable();
            $table->text('admin_notes')->nullable();
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->foreign('reporter_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('resolved_by')->references('id')->on('users')->onDelete('set null');
            
            $table->index('conversation_id', 'idx_chat_report_conversation');
            $table->index('reporter_id', 'idx_chat_report_reporter');
            $table->index('status', 'idx_chat_report_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_reports');
    }
};
