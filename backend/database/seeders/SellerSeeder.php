<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SellerSeeder extends Seeder
{
    public function run(): void
    {
        // Example: Map users by email to their IDs
        $userMap = DB::table('users')->pluck('id', 'email');
        $sellers = [
            [
            'user_email' => 'sara@example.com',
            'bio' => 'حرفية متخصصة في صناعة المجوهرات اليدوية من الفضة والأحجار الكريمة',
            'location' => 'القاهرة، مصر',
            'member_since' => '2020-05-15',
            'rating' => 4.8,
            'review_count' => 124,
            'completed_orders' => 215,
            'response_time' => '2 ساعة',
            'created_at' => now(),
            'updated_at' => now(),
            ],
            [
            'user_email' => 'ahmed@example.com',
            'bio' => 'حرفي متخصص في النحت على الخشب وصناعة الأثاث اليدوي التقليدي',
            'location' => 'الإسكندرية، مصر',
            'member_since' => '2019-11-20',
            'rating' => 4.9,
            'review_count' => 89,
            'completed_orders' => 178,
            'response_time' => '1 ساعة',
            'created_at' => now(),
            'updated_at' => now(),
            ],
            [
            'user_email' => 'fatima.seller@example.com',
            'bio' => 'متخصصة في صناعة المنسوجات اليدوية والتطريز التقليدي',
            'location' => 'أسيوط، مصر',
            'member_since' => '2021-02-10',
            'rating' => 4.7,
            'review_count' => 156,
            'completed_orders' => 230,
            'response_time' => '3 ساعة',
            'created_at' => now(),
            'updated_at' => now(),
            ],
            [
            'user_email' => 'mohammed@example.com',
            'bio' => 'حرفي متخصص في صناعة الفخار والخزف التقليدي',
            'location' => 'الفيوم، مصر',
            'member_since' => '2020-08-05',
            'rating' => 4.6,
            'review_count' => 78,
            'completed_orders' => 145,
            'response_time' => '4 ساعة',
            'created_at' => now(),
            'updated_at' => now(),
            ],
            [
            'user_email' => 'designer@example.com',
            'bio' => 'مصممة أزياء تخصصت في تصميم وخياطة الملابس التقليدية بلمسة عصرية',
            'location' => 'المنصورة، مصر',
            'member_since' => '2019-09-22',
            'rating' => 4.8,
            'review_count' => 95,
            'completed_orders' => 167,
            'response_time' => '3 ساعة',
            'created_at' => now(),
            'updated_at' => now(),
            ],
            [
            'user_email' => 'artist@example.com',
            'bio' => 'فنان تشكيلي متخصص في صناعة اللوحات والطابلوهات الفنية باستخدام تقنيات مختلفة',
            'location' => 'أسوان، مصر',
            'member_since' => '2020-06-18',
            'rating' => 4.7,
            'review_count' => 88,
            'completed_orders' => 142,
            'response_time' => '4 ساعة',
            'created_at' => now(),
            'updated_at' => now(),
            ],
            [
            'user_email' => 'crochet@example.com',
            'bio' => 'حرفية متخصصة في أعمال الكروشيه والحياكة اليدوية بتصاميم مبتكرة',
            'location' => 'طنطا، مصر',
            'member_since' => '2019-12-10',
            'rating' => 4.9,
            'review_count' => 147,
            'completed_orders' => 215,
            'response_time' => '1 ساعة',
            'created_at' => now(),
            'updated_at' => now(),
            ],
            [
            'user_email' => 'architect@example.com',
            'bio' => 'مهندس معماري متخصص في تصميم وتنفيذ قطع ديكور من الخرسانة (الكونكريت) بأشكال عصرية',
            'location' => 'بورسعيد، مصر',
            'member_since' => '2021-03-05',
            'rating' => 4.8,
            'review_count' => 76,
            'completed_orders' => 119,
            'response_time' => '2 ساعة',
            'created_at' => now(),
            'updated_at' => now(),
            ],
            [
            'user_email' => 'accessories@example.com',
            'bio' => 'مصممة اكسسوارات يدوية من مواد مختلفة بتصاميم فريدة ومميزة',
            'location' => 'الجيزة، مصر',
            'member_since' => '2020-04-22',
            'rating' => 4.7,
            'review_count' => 108,
            'completed_orders' => 187,
            'response_time' => '2 ساعة',
            'created_at' => now(),
            'updated_at' => now(),
            ],
        ];
        foreach ($sellers as $seller) {
            DB::table('sellers')->insert([
                'user_id' => $userMap[$seller['user_email']],
                'bio' => $seller['bio'],
                'location' => $seller['location'],
                'member_since' => $seller['member_since'],
                'rating' => $seller['rating'],
                'review_count' => $seller['review_count'],
                'completed_orders' => $seller['completed_orders'],
                'response_time' => $seller['response_time'],
                'created_at' => $seller['created_at'],
                'updated_at' => $seller['updated_at'],
            ]);
        }
    }
}
