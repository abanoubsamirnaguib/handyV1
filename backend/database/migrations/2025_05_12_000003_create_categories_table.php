<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('icon', 50)->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->dateTime('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
            $table->foreign('parent_id')->references('id')->on('categories')->onDelete('set null');
            $table->index('parent_id', 'idx_category_parent');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
