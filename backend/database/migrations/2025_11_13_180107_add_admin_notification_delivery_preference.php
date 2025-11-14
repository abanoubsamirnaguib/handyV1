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
        // إضافة إعداد طريقة استلام الإشعارات للمشرف
        // الخيارات: both (كلاهما), email (البريد فقط), dashboard (لوحة التحكم فقط)
        $exists = DB::table('site_settings')
            ->where('setting_key', 'admin_notification_delivery')
            ->exists();

        if (!$exists) {
            SiteSetting::create([
                'setting_key' => 'admin_notification_delivery',
                'setting_value' => 'both', // القيمة الافتراضية: كلاهما
                'description' => 'طريقة استلام إشعارات المشرف (both, email, dashboard)',
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('site_settings')
            ->where('setting_key', 'admin_notification_delivery')
            ->delete();
    }
};
