<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\SiteSetting;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // إعدادات إشعارات المستخدمين
        $userNotificationSettings = [
            ['setting_key' => 'user_notif_welcome', 'setting_value' => 'true', 'description' => 'إشعار الترحيب للمستخدمين الجدد'],
            ['setting_key' => 'user_notif_order_created', 'setting_value' => 'true', 'description' => 'إشعار إنشاء الطلب'],
            ['setting_key' => 'user_notif_order_status', 'setting_value' => 'true', 'description' => 'إشعار تحديث حالة الطلب'],
            ['setting_key' => 'user_notif_product_pending', 'setting_value' => 'true', 'description' => 'إشعار المنتج قيد المراجعة'],
            ['setting_key' => 'user_notif_product_approved', 'setting_value' => 'true', 'description' => 'إشعار الموافقة على المنتج'],
            ['setting_key' => 'user_notif_message', 'setting_value' => 'true', 'description' => 'إشعار الرسائل الجديدة'],
            ['setting_key' => 'user_notif_review', 'setting_value' => 'true', 'description' => 'إشعار التقييمات الجديدة'],
            ['setting_key' => 'user_notif_payment', 'setting_value' => 'true', 'description' => 'إشعار استلام الدفعات'],
            ['setting_key' => 'user_notif_system', 'setting_value' => 'true', 'description' => 'إشعارات النظام'],
        ];

        // إعدادات إشعارات المشرفين
        $adminNotificationSettings = [
            ['setting_key' => 'admin_notif_new_user', 'setting_value' => 'true', 'description' => 'إشعار تسجيل مستخدم جديد'],
            ['setting_key' => 'admin_notif_new_order', 'setting_value' => 'true', 'description' => 'إشعار طلب جديد'],
            ['setting_key' => 'admin_notif_product_pending', 'setting_value' => 'true', 'description' => 'إشعار منتج جديد يحتاج مراجعة'],
            ['setting_key' => 'admin_notif_product_report', 'setting_value' => 'true', 'description' => 'إشعار الإبلاغ عن منتج'],
            ['setting_key' => 'admin_notif_chat_report', 'setting_value' => 'true', 'description' => 'إشعار الإبلاغ عن محادثة'],
            ['setting_key' => 'admin_notif_withdrawal_request', 'setting_value' => 'true', 'description' => 'إشعار طلب سحب جديد'],
            ['setting_key' => 'admin_notif_contact_message', 'setting_value' => 'true', 'description' => 'إشعار رسالة تواصل جديدة'],
            ['setting_key' => 'admin_notification_email', 'setting_value' => 'admin@example.com', 'description' => 'بريد المشرف للإشعارات'],
        ];

        foreach (array_merge($userNotificationSettings, $adminNotificationSettings) as $setting) {
            // Check if setting already exists
            $exists = DB::table('site_settings')
                ->where('setting_key', $setting['setting_key'])
                ->exists();

            if (!$exists) {
                SiteSetting::create([
                    'setting_key' => $setting['setting_key'],
                    'setting_value' => $setting['setting_value'],
                    'description' => $setting['description'],
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $settingsToRemove = [
            'user_notif_welcome',
            'user_notif_order_created',
            'user_notif_order_status',
            'user_notif_product_pending',
            'user_notif_product_approved',
            'user_notif_message',
            'user_notif_review',
            'user_notif_payment',
            'user_notif_system',
            'admin_notif_new_user',
            'admin_notif_new_order',
            'admin_notif_product_pending',
            'admin_notif_product_report',
            'admin_notif_chat_report',
            'admin_notif_withdrawal_request',
            'admin_notif_contact_message',
            'admin_notification_email',
        ];

        DB::table('site_settings')
            ->whereIn('setting_key', $settingsToRemove)
            ->delete();
    }
};

