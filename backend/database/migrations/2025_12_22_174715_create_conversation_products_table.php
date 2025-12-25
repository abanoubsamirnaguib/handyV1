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
        Schema::create('conversation_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('conversation_id');
            $table->unsignedBigInteger('product_id');
            $table->string('product_type'); // 'gig' or 'product'
            $table->string('product_title');
            $table->text('product_image')->nullable();
            $table->decimal('product_price', 10, 2)->nullable();
            $table->timestamp('added_at');
            $table->timestamps();
            
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            
            // Prevent duplicate products in same conversation
            $table->unique(['conversation_id', 'product_id'], 'unique_conversation_product');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversation_products');
    }
};
