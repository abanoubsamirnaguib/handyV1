<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->uuid('product_id');
            $table->string('image_url', 255);
            $table->integer('display_order')->default(0);
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->index('product_id', 'idx_product_images');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
    }
};
