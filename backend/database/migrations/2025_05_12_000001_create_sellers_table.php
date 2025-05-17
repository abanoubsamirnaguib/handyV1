<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sellers', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->text('bio')->nullable();
            $table->string('location', 100)->nullable();
            $table->dateTime('member_since')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('review_count')->default(0);
            $table->integer('completed_orders')->default(0);
            $table->string('response_time', 50)->nullable();
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->index('rating', 'idx_seller_rating');
            $table->index('location', 'idx_seller_location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sellers');
    }
};
