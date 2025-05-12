<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_tags', function (Blueprint $table) {
            $table->id();
            $table->uuid('product_id');
            $table->string('tag_name', 50);
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->unique(['product_id', 'tag_name'], 'unique_product_tag');
            $table->index('tag_name', 'idx_product_tags');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_tags');
    }
};
