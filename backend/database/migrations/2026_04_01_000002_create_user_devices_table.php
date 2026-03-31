<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_devices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('ip_address', 45);
            $table->string('mac_address', 32)->nullable();
            $table->string('device_fingerprint', 255)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('registered_at')->useCurrent();
            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->index('user_id', 'idx_user_devices_user_id');
            $table->unique('ip_address', 'uq_user_devices_ip_address');
            $table->unique('mac_address', 'uq_user_devices_mac_address');
            $table->unique('device_fingerprint', 'uq_user_devices_fingerprint');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_devices');
    }
};
