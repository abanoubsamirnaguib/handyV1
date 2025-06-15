<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('seller_id');
            $table->string('title', 255);
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->unsignedBigInteger('category_id');
            $table->string('delivery_time', 50)->nullable();
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('review_count')->default(0);
            $table->boolean('featured')->default(false);
            $table->enum('status', ['active', 'inactive', 'pending_review', 'rejected'])->default('active');
            $table->enum('type', ['gig', 'product'])->default('gig');
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->foreign('seller_id')->references('id')->on('sellers')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('restrict');
            $table->index('seller_id', 'idx_product_seller');
            $table->index('category_id', 'idx_product_category');
            $table->index('featured', 'idx_product_featured');
            $table->index('status', 'idx_product_status');
            $table->index('price', 'idx_product_price');
            $table->index('rating', 'idx_product_rating');
            // Fulltext index is not natively supported in Laravel migrations, add manually if needed
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
