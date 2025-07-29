<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Announcement;
use App\Models\User;
use Carbon\Carbon;

class AnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // البحث عن أول مستخدم أدمن أو إنشاء مستخدم افتراضي
        $admin = User::where('role', 'admin')->first();
        
        if (!$admin) {
            $admin = User::create([
                'name' => 'مدير النظام',
                'email' => 'admin@bazaar.com',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
        }

        $announcements = [
            [
                'title' => 'مرحباً بكم في منصة بازار',
                'content' => 'نرحب بجميع الحرفيين والعملاء في منصة بازار للمنتجات اليدوية. نهدف إلى تقديم أفضل تجربة تسوق للمنتجات الحرفية الفريدة.',
                'type' => 'success',
                'priority' => 'high',
                'is_active' => true,
                'created_by' => $admin->id,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                'title' => 'تحديث سياسة الخصوصية',
                'content' => 'تم تحديث سياسة الخصوصية الخاصة بالمنصة لضمان حماية أفضل لبياناتكم الشخصية. يرجى مراجعة السياسة الجديدة من قسم السياسات.',
                'type' => 'info',
                'priority' => 'medium',
                'is_active' => true,
                'created_by' => $admin->id,
                'created_at' => Carbon::now()->subHours(12),
                'updated_at' => Carbon::now()->subHours(12),
            ],
            [
                'title' => 'عرض خاص - خصم 20% على جميع المنتجات',
                'content' => 'استمتعوا بخصم 20% على جميع المنتجات اليدوية لفترة محدودة. العرض ساري حتى نهاية الشهر الجاري. لا تفوتوا الفرصة!',
                'type' => 'success',
                'priority' => 'high',
                'is_active' => true,
                'starts_at' => Carbon::now()->subDays(2),
                'ends_at' => Carbon::now()->addDays(15),
                'created_by' => $admin->id,
                'created_at' => Carbon::now()->subHours(8),
                'updated_at' => Carbon::now()->subHours(8),
            ],
            [
                'title' => 'صيانة مجدولة للمنصة',
                'content' => 'ستخضع المنصة لأعمال صيانة مجدولة يوم السبت المقبل من الساعة 2:00 صباحاً حتى 6:00 صباحاً. قد تواجهون انقطاع مؤقت في الخدمة خلال هذه الفترة.',
                'type' => 'warning',
                'priority' => 'medium',
                'is_active' => true,
                'starts_at' => Carbon::now()->addDays(3),
                'created_by' => $admin->id,
                'created_at' => Carbon::now()->subHours(6),
                'updated_at' => Carbon::now()->subHours(6),
            ],
            [
                'title' => 'مسابقة أفضل منتج حرفي',
                'content' => 'شاركوا في مسابقة أفضل منتج حرفي واربحوا جوائز قيمة! المسابقة مفتوحة لجميع الحرفيين المسجلين في المنصة. آخر موعد للتقديم هو نهاية الشهر.',
                'type' => 'info',
                'priority' => 'medium',
                'is_active' => true,
                'ends_at' => Carbon::now()->addDays(20),
                'created_by' => $admin->id,
                'created_at' => Carbon::now()->subHours(4),
                'updated_at' => Carbon::now()->subHours(4),
            ],
            [
                'title' => 'تحديث شروط الاستخدام',
                'content' => 'تم تحديث شروط الاستخدام الخاصة بالمنصة. يرجى مراجعة الشروط الجديدة للتأكد من التزامكم بالقوانين المحدثة.',
                'type' => 'warning',
                'priority' => 'low',
                'is_active' => true,
                'created_by' => $admin->id,
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subHours(2),
            ],
            [
                'title' => 'إضافة طرق دفع جديدة',
                'content' => 'تم إضافة طرق دفع جديدة لتسهيل عملية الشراء. يمكنكم الآن الدفع عبر فودافون كاش وأورانج موني بالإضافة إلى الطرق التقليدية.',
                'type' => 'success',
                'priority' => 'medium',
                'is_active' => true,
                'created_by' => $admin->id,
                'created_at' => Carbon::now()->subHour(),
                'updated_at' => Carbon::now()->subHour(),
            ],
            [
                'title' => 'إعلان غير نشط للاختبار',
                'content' => 'هذا إعلان غير نشط لاختبار النظام. لن يظهر للزوار.',
                'type' => 'info',
                'priority' => 'low',
                'is_active' => false,
                'created_by' => $admin->id,
                'created_at' => Carbon::now()->subMinutes(30),
                'updated_at' => Carbon::now()->subMinutes(30),
            ],
        ];

        foreach ($announcements as $announcement) {
            Announcement::create($announcement);
        }

        $this->command->info('تم إنشاء ' . count($announcements) . ' إعلانات تجريبية بنجاح!');
    }
} 