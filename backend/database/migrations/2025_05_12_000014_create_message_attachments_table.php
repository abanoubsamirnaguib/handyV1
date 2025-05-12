<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_attachments', function (Blueprint $table) {
            $table->id();
            $table->uuid('message_id');
            $table->string('file_url', 255);
            $table->string('file_type', 50)->nullable();
            $table->dateTime('uploaded_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreign('message_id')->references('id')->on('messages')->onDelete('cascade');
            $table->index('message_id', 'idx_attachment_message');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('message_attachments');
    }
};
