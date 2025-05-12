<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductTagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['product_id' => 'g1', 'tag_name' => 'فضة', 'created_at' => now()],
            ['product_id' => 'g1', 'tag_name' => 'مجوهرات', 'created_at' => now()],
            ['product_id' => 'g1', 'tag_name' => 'مخصص', 'created_at' => now()],
            ['product_id' => 'g1', 'tag_name' => 'هدايا', 'created_at' => now()],
            ['product_id' => 'g2', 'tag_name' => 'خشب', 'created_at' => now()],
            ['product_id' => 'g2', 'tag_name' => 'نحت', 'created_at' => now()],
            ['product_id' => 'g2', 'tag_name' => 'صناديق', 'created_at' => now()],
            ['product_id' => 'g2', 'tag_name' => 'ديكور', 'created_at' => now()],
            ['product_id' => 'g3', 'tag_name' => 'تطريز', 'created_at' => now()],
            ['product_id' => 'g3', 'tag_name' => 'وسائد', 'created_at' => now()],
            ['product_id' => 'g3', 'tag_name' => 'تراثي', 'created_at' => now()],
            ['product_id' => 'g3', 'tag_name' => 'ديكور منزلي', 'created_at' => now()],
        ];
        foreach ($tags as $tag) {
            DB::table('product_tags')->insert($tag);
        }
    }
}
