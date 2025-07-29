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
        // Add default admin site settings
        $defaultSettings = [
            // General settings
            ['setting_key' => 'site_name', 'setting_value' => 'منصة الصنايعي'],
            ['setting_key' => 'site_description', 'setting_value' => 'منصة تسويق المنتجات الحرفية اليدوية'],
            ['setting_key' => 'logo_url', 'setting_value' => '/logo.png'],
            ['setting_key' => 'favicon_url', 'setting_value' => '/favicon.ico'],
            ['setting_key' => 'maintenance_mode', 'setting_value' => 'false'],
            ['setting_key' => 'registrations_enabled', 'setting_value' => 'true'],
            ['setting_key' => 'default_language', 'setting_value' => 'ar'],
            ['setting_key' => 'default_currency', 'setting_value' => 'EGP'],
            
            // Email settings
            ['setting_key' => 'email_sender_name', 'setting_value' => 'منصة الصنايعي'],
            ['setting_key' => 'email_sender_email', 'setting_value' => 'no-reply@example.com'],
            ['setting_key' => 'smtp_server', 'setting_value' => 'smtp.example.com'],
            ['setting_key' => 'smtp_port', 'setting_value' => '587'],
            ['setting_key' => 'smtp_username', 'setting_value' => 'smtp-user'],
            ['setting_key' => 'smtp_password', 'setting_value' => ''],
            ['setting_key' => 'use_smtp', 'setting_value' => 'true'],
            
            // Notification settings
            ['setting_key' => 'notify_new_users', 'setting_value' => 'true'],
            ['setting_key' => 'notify_new_orders', 'setting_value' => 'true'],
            ['setting_key' => 'notify_product_reports', 'setting_value' => 'true'],
            ['setting_key' => 'notify_chat_reports', 'setting_value' => 'true'],
            ['setting_key' => 'notify_low_stock', 'setting_value' => 'true'],
            ['setting_key' => 'admin_emails', 'setting_value' => 'admin@example.com'],
            
            // Security settings
            ['setting_key' => 'require_email_verification', 'setting_value' => 'true'],
            ['setting_key' => 'two_factor_auth_enabled', 'setting_value' => 'false'],
            ['setting_key' => 'password_min_length', 'setting_value' => '8'],
            ['setting_key' => 'password_requires_uppercase', 'setting_value' => 'true'],
            ['setting_key' => 'password_requires_number', 'setting_value' => 'true'],
            ['setting_key' => 'password_requires_symbol', 'setting_value' => 'false'],
            ['setting_key' => 'session_timeout', 'setting_value' => '120'],
        ];

        foreach ($defaultSettings as $setting) {
            DB::table('site_settings')->updateOrInsert(
                ['setting_key' => $setting['setting_key']],
                [
                    'setting_value' => $setting['setting_value'],
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $settingKeys = [
            'site_name', 'site_description', 'logo_url', 'favicon_url', 
            'maintenance_mode', 'registrations_enabled', 'default_language', 'default_currency',
            'email_sender_name', 'email_sender_email', 'smtp_server', 'smtp_port', 
            'smtp_username', 'smtp_password', 'use_smtp',
            'notify_new_users', 'notify_new_orders', 'notify_product_reports', 
            'notify_chat_reports', 'notify_low_stock', 'admin_emails',
            'require_email_verification', 'two_factor_auth_enabled', 'password_min_length',
            'password_requires_uppercase', 'password_requires_number', 'password_requires_symbol',
            'session_timeout'
        ];

        DB::table('site_settings')->whereIn('setting_key', $settingKeys)->delete();
    }
};
