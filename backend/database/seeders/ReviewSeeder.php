<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Map product and user string IDs to integer IDs from the database
        $productMapping = [
            'g1' => 1,
            'g2' => 2,
            'g3' => 3,
        ];

        $userMapping = [
            'u1' => 1,
            'u2' => 2,
            'u3' => 3,
            'u4' => 4,
        ];

        $reviews = [
            [
                'product_id' => $productMapping['g1'],
                'user_id' => $userMapping['u1'],
                'rating' => 5,
                'comment' => 'المجوهرات رائعة جدًا وبجودة عالية. التصميم فريد والتنفيذ احترافي. سعيدة جدًا بالشراء وسأعود مرة أخرى.',
                'review_date' => '2023-08-15',
                'status' => 'published',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => $productMapping['g1'],
                'user_id' => $userMapping['u2'],
                'rating' => 4,
                'comment' => 'جودة المنتج ممتازة والتصميم جميل. التسليم تأخر قليلاً عن الموعد المحدد لكن النتيجة النهائية تستحق الانتظار.',
                'review_date' => '2023-07-22',
                'status' => 'published',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => $productMapping['g2'],
                'user_id' => $userMapping['u3'],
                'rating' => 5,
                'comment' => 'الصندوق الخشبي رائع والنحت دقيق جدًا. استخدمته كهدية وكان الجميع معجبًا به. شكرًا على العمل الرائع!',
                'review_date' => '2023-09-05',
                'status' => 'published',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => $productMapping['g3'],
                'user_id' => $userMapping['u4'],
                'rating' => 4,
                'comment' => 'الوسائد جميلة جدًا والتطريز دقيق. الألوان زاهية والقماش ذو جودة عالية. أنصح بالشراء من هذا البائع.',
                'review_date' => '2023-08-30',
                'status' => 'published',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        foreach ($reviews as $review) {
            DB::table('reviews')->insert($review);
        }
    }
}
