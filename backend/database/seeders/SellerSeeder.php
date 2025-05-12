<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SellerSeeder extends Seeder
{
    public function run(): void
    {
        $sellers = [
            [
                'id' => 's1',
                'user_id' => 's1', // فاطمة خالد
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
                'id' => 's2',
                'user_id' => 's2', // علي حسن
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
                'id' => 's3',
                'user_id' => 's3', // ليلى إبراهيم
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
                'id' => 's4',
                'user_id' => 's4', // خالد عبدالله
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
                'id' => 's5',
                'user_id' => 's5', // مريم سعيد
                'bio' => 'متخصصة في صناعة العطور الطبيعية والزيوت العطرية المستخلصة من نباتات محلية',
                'location' => 'الأقصر، مصر',
                'member_since' => '2020-01-15',
                'rating' => 4.9,
                'review_count' => 112,
                'completed_orders' => 198,
                'response_time' => '2 ساعة',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 's6',
                'user_id' => 's6', // مصممة أزياء
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
                'id' => 's7',
                'user_id' => 's7', // فنان تشكيلي
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
                'id' => 's8',
                'user_id' => 's8', // حرفية كروشيه
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
                'id' => 's9',
                'user_id' => 's9', // مهندس معماري
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
                'id' => 's10',
                'user_id' => 's10', // مصممة اكسسوارات
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
            [
                'id' => 's11',
                'user_id' => 's11',
                'bio' => 'حرفي متخصص في أعمال الريزن وصناعة القطع الفنية والديكورية باستخدام تقنيات مختلفة',
                'location' => 'الإسماعيلية، مصر',
                'member_since' => '2021-01-15',
                'rating' => 4.9,
                'review_count' => 92,
                'completed_orders' => 158,
                'response_time' => '3 ساعة',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 's12',
                'user_id' => "s12",
                'bio' => 'طاهية متخصصة في المأكولات المصرية التقليدية والحلويات المنزلية المصنوعة بوصفات عائلية',
                'location' => 'الزقازيق، مصر',
                'member_since' => '2020-07-10',
                'rating' => 4.8,
                'review_count' => 134,
                'completed_orders' => 226,
                'response_time' => '1 ساعة',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        foreach ($sellers as $seller) {
            DB::table('sellers')->insert($seller);
        }
    }
}
