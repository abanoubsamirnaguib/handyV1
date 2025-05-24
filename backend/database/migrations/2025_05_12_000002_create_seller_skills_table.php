<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seller_skills', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('seller_id');
            $table->string('skill_name', 100);
            $table->dateTime('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->foreign('seller_id')->references('id')->on('sellers')->onDelete('cascade');
            $table->unique(['seller_id', 'skill_name'], 'unique_seller_skill');
            $table->index('skill_name', 'idx_seller_skills');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_skills');
    }
};
