<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductTagSeeder extends Seeder
{
    public function run(): void
    {
        $productTags = [
            ['product_id' => 1, 'tag_name' => 'فضة'],
            ['product_id' => 1, 'tag_name' => 'مجوهرات'],
            ['product_id' => 1, 'tag_name' => 'مخصص'],
            ['product_id' => 2, 'tag_name' => 'هدايا'],
            ['product_id' => 2, 'tag_name' => 'خشب'],
            ['product_id' => 2, 'tag_name' => 'نحت'],
            ['product_id' => 3, 'tag_name' => 'صناديق'],
            ['product_id' => 3, 'tag_name' => 'ديكور'],
            ['product_id' => 3, 'tag_name' => 'تطريز'],
            ['product_id' => 4, 'tag_name' => 'وسائد'],
            ['product_id' => 4, 'tag_name' => 'تراثي'],
            ['product_id' => 4, 'tag_name' => 'ديكور منزلي'],
            ['product_id' => 5, 'tag_name' => 'فضة'],
            ['product_id' => 5, 'tag_name' => 'أحجار كريمة'],
            ['product_id' => 5, 'tag_name' => 'إكسسوارات'],
            ['product_id' => 6, 'tag_name' => 'خشب'],
            ['product_id' => 6, 'tag_name' => 'ديكور'],
            ['product_id' => 6, 'tag_name' => 'رفوف'],
            ['product_id' => 7, 'tag_name' => 'حقائب'],
            ['product_id' => 7, 'tag_name' => 'تطريز'],
            ['product_id' => 7, 'tag_name' => 'تراثي'],
            ['product_id' => 8, 'tag_name' => 'فخار'],
            ['product_id' => 8, 'tag_name' => 'قهوة'],
            ['product_id' => 8, 'tag_name' => 'هدايا'],
            ['product_id' => 9, 'tag_name' => 'عطور'],
            ['product_id' => 9, 'tag_name' => 'شرقي'],
            ['product_id' => 9, 'tag_name' => 'تراثي'],
            ['product_id' => 10, 'tag_name' => 'زيوت'],
            ['product_id' => 10, 'tag_name' => 'عطور'],
            ['product_id' => 10, 'tag_name' => 'طبيعي'],
        ];

        foreach ($productTags as $tag) {
            DB::table('product_tags')->insert([
                'product_id' => $tag['product_id'],
                'tag_name' => $tag['tag_name'],
                'created_at' => now(),
            ]);
        }
    }
}
