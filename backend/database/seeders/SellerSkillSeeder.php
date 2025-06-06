<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SellerSkillSeeder extends Seeder
{
    public function run(): void
    {
        // Skills are now stored in the users table as JSON, not in seller_skills table
        // This seeder is kept for backward compatibility but does nothing
        // Skills are populated by SellerSeeder
        
        // If you still want to use the seller_skills table for additional functionality,
        // you can uncomment and modify the code below
        
        /*
        // Assign skills to sellers by seller_id (1-based, sequential)
        $sellerSkills = [
            // seller_id => [skills]
            1 => ['المجوهرات', 'الفضة', 'الأحجار الكريمة'],
            2 => ['النحت على الخشب', 'الأثاث اليدوي', 'الديكور'],
            3 => ['المنسوجات', 'التطريز', 'الكروشيه'],
            4 => ['الفخار', 'الخزف', 'الرسم على الفخار'],
            5 => ['تصميم أزياء', 'خياطة', 'تطريز'],
            6 => ['رسم', 'نحت', 'ديكور'],
            7 => ['كروشيه', 'حياكة', 'تصميم'],
            8 => ['تصميم معماري', 'كونكريت', 'ديكور منزلي'],
            9 => ['مجوهرات', 'اكسسوارات', 'تصميم'],
        ];

        foreach ($sellerSkills as $sellerId => $skills) {
            foreach ($skills as $skill) {
                DB::table('seller_skills')->insert([
                    'seller_id' => $sellerId,
                    'skill_name' => $skill,
                    'created_at' => now(),
                ]);
            }
        }
        */
    }
}
