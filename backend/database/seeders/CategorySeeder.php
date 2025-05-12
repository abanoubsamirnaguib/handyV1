<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['id' => 'jewelry', 'name' => 'المجوهرات', 'icon' => 'gem'],
            ['id' => 'pottery', 'name' => 'الفخار', 'icon' => 'coffee'],
            ['id' => 'textiles', 'name' => 'المنسوجات', 'icon' => 'scissors'],
            ['id' => 'woodwork', 'name' => 'أعمال الخشب', 'icon' => 'axe'],
            ['id' => 'leatherwork', 'name' => 'أعمال الجلد', 'icon' => 'briefcase'],
            ['id' => 'painting', 'name' => 'الرسم', 'icon' => 'palette'],
            ['id' => 'candles', 'name' => 'الشموع', 'icon' => 'flame'],
            ['id' => 'soap', 'name' => 'الصابون', 'icon' => 'droplet'],
            ['id' => 'perfumes', 'name' => 'عطور', 'icon' => 'spray-can'],
            ['id' => 'clothes', 'name' => 'ملابس', 'icon' => 'shirt'],
            ['id' => 'tableaux', 'name' => 'طابلوهات', 'icon' => 'image'],
            ['id' => 'tatreez', 'name' => 'تطويز', 'icon' => 'needle'],
            ['id' => 'crochet', 'name' => 'كورشية', 'icon' => 'thread'],
            ['id' => 'concrete', 'name' => 'كونكريت', 'icon' => 'hammer'],
            ['id' => 'accessories', 'name' => 'اكسسوارات', 'icon' => 'watch'],
            ['id' => 'resin', 'name' => 'ريزن', 'icon' => 'dribbble'],
            ['id' => 'food', 'name' => 'الاكل', 'icon' => 'utensils'],
        ];
        foreach ($categories as $cat) {
            DB::table('categories')->insert([
                'id' => $cat['id'],
                'name' => $cat['name'],
                'icon' => $cat['icon'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
