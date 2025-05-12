<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SellerSkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            ['seller_id' => 's1', 'skill_name' => 'المجوهرات'],
            ['seller_id' => 's1', 'skill_name' => 'الفضة'],
            ['seller_id' => 's1', 'skill_name' => 'الأحجار الكريمة'],
            ['seller_id' => 's2', 'skill_name' => 'النحت على الخشب'],
            ['seller_id' => 's2', 'skill_name' => 'الأثاث اليدوي'],
            ['seller_id' => 's2', 'skill_name' => 'الديكور'],
            ['seller_id' => 's3', 'skill_name' => 'المنسوجات'],
            ['seller_id' => 's3', 'skill_name' => 'التطريز'],
            ['seller_id' => 's3', 'skill_name' => 'الكروشيه'],
            ['seller_id' => 's4', 'skill_name' => 'الفخار'],
            ['seller_id' => 's4', 'skill_name' => 'الخزف'],
            ['seller_id' => 's4', 'skill_name' => 'الرسم على الفخار'],
            ['seller_id' => 's5', 'skill_name' => 'العطور'],
            ['seller_id' => 's5', 'skill_name' => 'الزيوت الطبيعية'],
            ['seller_id' => 's5', 'skill_name' => 'الاستخلاص'],
            ['seller_id' => 's6', 'skill_name' => 'تصميم أزياء'],
            ['seller_id' => 's6', 'skill_name' => 'خياطة'],
            ['seller_id' => 's6', 'skill_name' => 'تطريز'],
            ['seller_id' => 's7', 'skill_name' => 'رسم'],
            ['seller_id' => 's7', 'skill_name' => 'نحت'],
            ['seller_id' => 's7', 'skill_name' => 'ديكور'],
            ['seller_id' => 's8', 'skill_name' => 'كروشيه'],
            ['seller_id' => 's8', 'skill_name' => 'حياكة'],
            ['seller_id' => 's8', 'skill_name' => 'تصميم'],
            ['seller_id' => 's9', 'skill_name' => 'تصميم معماري'],
            ['seller_id' => 's9', 'skill_name' => 'كونكريت'],
            ['seller_id' => 's9', 'skill_name' => 'ديكور منزلي'],
            ['seller_id' => 's10', 'skill_name' => 'مجوهرات'],
            ['seller_id' => 's10', 'skill_name' => 'اكسسوارات'],
            ['seller_id' => 's10', 'skill_name' => 'تصميم'],
            ['seller_id' => 's11', 'skill_name' => 'ريزن'],
            ['seller_id' => 's11', 'skill_name' => 'ديكور'],
            ['seller_id' => 's11', 'skill_name' => 'فنون'],
            ['seller_id' => 's12', 'skill_name' => 'طبخ'],
            ['seller_id' => 's12', 'skill_name' => 'حلويات'],
            ['seller_id' => 's12', 'skill_name' => 'وصفات تقليدية'],
        ];
        foreach ($skills as $skill) {
            DB::table('seller_skills')->insert([
                'seller_id' => $skill['seller_id'],
                'skill_name' => $skill['skill_name'],
                'created_at' => now(),
            ]);
        }
    }
}
