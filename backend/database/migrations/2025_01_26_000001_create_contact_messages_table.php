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
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('email', 255);
            $table->string('phone', 20)->nullable();
            $table->string('subject', 500)->nullable();
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->boolean('is_resolved')->default(false);
            $table->text('admin_notes')->nullable();
            $table->dateTime('resolved_at')->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            
            $table->foreign('resolved_by')->references('id')->on('users')->onDelete('set null');
            $table->index('is_read', 'idx_contact_read');
            $table->index('is_resolved', 'idx_contact_resolved');
            $table->index('created_at', 'idx_contact_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
    }
}; 