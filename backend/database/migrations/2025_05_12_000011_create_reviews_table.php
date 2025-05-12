<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->uuid('user_id');
            $table->integer('rating');
            $table->text('comment')->nullable();
            $table->dateTime('review_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->enum('status', ['published', 'hidden', 'pending'])->default('published');
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['user_id', 'product_id'], 'unique_user_product_review');
            $table->index('product_id', 'idx_review_product');
            $table->index('rating', 'idx_review_rating');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
