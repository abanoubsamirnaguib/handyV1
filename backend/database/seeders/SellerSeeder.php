<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SellerSeeder extends Seeder
{
    public function run(): void
    {
        // Update users with seller role to include bio and skills data
        $userMap = DB::table('users')->pluck('id', 'email');
        
        $sellersData = [
            [
                'user_email' => 'sara@example.com',
                'bio' => 'حرفية متخصصة في صناعة المجوهرات اليدوية من الفضة والأحجار الكريمة',
                'skills' => ['المجوهرات', 'الفضة', 'الأحجار الكريمة'],
                'member_since' => '2020-05-15',
                'rating' => 4.8,
                'review_count' => 124,
                'completed_orders' => 215,
                'response_time' => '2 ساعة',
            ],
            [
                'user_email' => 'mohammed@example.com',
                'bio' => 'حرفي متخصص في النحت على الخشب وصناعة الأثاث اليدوي التقليدي',
                'skills' => ['النحت على الخشب', 'الأثاث اليدوي', 'الديكور'],
                'member_since' => '2019-11-20',
                'rating' => 4.9,
                'review_count' => 89,
                'completed_orders' => 178,
                'response_time' => '1 ساعة',
            ],
            [
                'user_email' => 'fatima.seller@example.com',
                'bio' => 'متخصصة في صناعة المنسوجات اليدوية والتطريز التقليدي',
                'skills' => ['المنسوجات', 'التطريز', 'الكروشيه'],
                'member_since' => '2021-02-10',
                'rating' => 4.7,
                'review_count' => 156,
                'completed_orders' => 230,
                'response_time' => '3 ساعة',
            ],
            [
                'user_email' => 'ali.seller@example.com',
                'bio' => 'حرفي متخصص في صناعة الفخار والخزف التقليدي',
                'skills' => ['الفخار', 'الخزف', 'الرسم على الفخار'],
                'member_since' => '2020-08-05',
                'rating' => 4.6,
                'review_count' => 78,
                'completed_orders' => 145,
                'response_time' => '4 ساعة',
            ],
            [
                'user_email' => 'designer@example.com',
                'bio' => 'مصممة أزياء تخصصت في تصميم وخياطة الملابس التقليدية بلمسة عصرية',
                'skills' => ['تصميم أزياء', 'خياطة', 'تطريز'],
                'member_since' => '2019-09-22',
                'rating' => 4.8,
                'review_count' => 95,
                'completed_orders' => 167,
                'response_time' => '3 ساعة',
            ],
            [
                'user_email' => 'artist@example.com',
                'bio' => 'فنان تشكيلي متخصص في صناعة اللوحات والطابلوهات الفنية باستخدام تقنيات مختلفة',
                'skills' => ['رسم', 'نحت', 'ديكور'],
                'member_since' => '2020-06-18',
                'rating' => 4.7,
                'review_count' => 88,
                'completed_orders' => 142,
                'response_time' => '4 ساعة',
            ],
            [
                'user_email' => 'crochet@example.com',
                'bio' => 'حرفية متخصصة في أعمال الكروشيه والحياكة اليدوية بتصاميم مبتكرة',
                'skills' => ['كروشيه', 'حياكة', 'تصميم'],
                'member_since' => '2019-12-10',
                'rating' => 4.9,
                'review_count' => 147,
                'completed_orders' => 215,
                'response_time' => '1 ساعة',
            ],
            [
                'user_email' => 'architect@example.com',
                'bio' => 'مهندس معماري متخصص في تصميم وتنفيذ قطع ديكور من الخرسانة (الكونكريت) بأشكال عصرية',
                'skills' => ['تصميم معماري', 'كونكريت', 'ديكور منزلي'],
                'member_since' => '2021-03-05',
                'rating' => 4.8,
                'review_count' => 76,
                'completed_orders' => 119,
                'response_time' => '2 ساعة',
            ],
            [
                'user_email' => 'accessories@example.com',
                'bio' => 'مصممة اكسسوارات يدوية من مواد مختلفة بتصاميم فريدة ومميزة',
                'skills' => ['مجوهرات', 'اكسسوارات', 'تصميم'],
                'member_since' => '2020-04-22',
                'rating' => 4.7,
                'review_count' => 108,
                'completed_orders' => 187,
                'response_time' => '2 ساعة',
            ],
        ];
        
        // First, update users table with bio only (not skills)
        foreach ($sellersData as $sellerData) {
            if (isset($userMap[$sellerData['user_email']])) {
                DB::table('users')->where('id', $userMap[$sellerData['user_email']])->update([
                    'bio' => $sellerData['bio'],
                ]);
            }
        }
        
        // Then, create seller profiles (without duplicate bio/location/status)
        foreach ($sellersData as $sellerData) {
            if (isset($userMap[$sellerData['user_email']])) {
                $userId = $userMap[$sellerData['user_email']];
                
                // Insert seller record and get ID
                $sellerId = DB::table('sellers')->insertGetId([
                    'user_id' => $userId,
                    'member_since' => $sellerData['member_since'],
                    'rating' => $sellerData['rating'],
                    'review_count' => $sellerData['review_count'],
                    'completed_orders' => $sellerData['completed_orders'],
                    'response_time' => $sellerData['response_time'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                // Create seller skills records
                if ($sellerId && !empty($sellerData['skills'])) {
                    // Insert skills into seller_skills table
                    foreach ($sellerData['skills'] as $skill) {
                        DB::table('seller_skills')->insert([
                            'seller_id' => $sellerId,
                            'skill_name' => $skill,
                            'created_at' => now(),
                        ]);
                    }
                }
            }
        }
    }
}
