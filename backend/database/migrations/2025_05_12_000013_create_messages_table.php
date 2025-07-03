<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('conversation_id');
            $table->unsignedBigInteger('sender_id');
            $table->unsignedBigInteger('recipient_id');
            $table->text('message_text');
            $table->boolean('read_status')->default(false);
            $table->dateTime('message_time')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('recipient_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('conversation_id', 'idx_message_conversation');
            $table->index('sender_id', 'idx_message_sender');
            $table->index('recipient_id', 'idx_message_recipient');
            $table->index('message_time', 'idx_message_time');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
