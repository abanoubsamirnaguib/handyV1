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
            ['name' => 'المجوهرات', 'icon' => 'gem'],
            ['name' => 'الفخار', 'icon' => 'coffee'],
            ['name' => 'المنسوجات', 'icon' => 'scissors'],
            ['name' => 'أعمال الخشب', 'icon' => 'axe'],
            ['name' => 'أعمال الجلد', 'icon' => 'briefcase'],
            ['name' => 'الرسم', 'icon' => 'palette'],
            ['name' => 'الشموع', 'icon' => 'flame'],
            ['name' => 'الصابون', 'icon' => 'droplet'],
            ['name' => 'عطور', 'icon' => 'spray-can'],
            ['name' => 'ملابس', 'icon' => 'shirt'],
            ['name' => 'طابلوهات', 'icon' => 'image'],
            ['name' => 'تطريز', 'icon' => 'needle'],
            ['name' => 'كورشية', 'icon' => 'thread'],
            ['name' => 'كونكريت', 'icon' => 'hammer'],
            ['name' => 'اكسسوارات', 'icon' => 'watch'],
            ['name' => 'ريزن', 'icon' => 'dribbble'],
            ['name' => 'الاكل', 'icon' => 'utensils'],
        ];
        foreach ($categories as $cat) {
            DB::table('categories')->insert([
                'name' => $cat['name'],
                'icon' => $cat['icon'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
