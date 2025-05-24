<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        // Use explicit product IDs (1-10) to relate images to products
        $images = [
            // Product 1
            ['product_id' => 1, 'image_url' => 'https://images.unsplash.com/photo-1611085583191-a3b181a88401', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 1, 'image_url' => 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584', 'display_order' => 1, 'created_at' => now()],
            // Product 2
            ['product_id' => 2, 'image_url' => 'https://plus.unsplash.com/premium_photo-1677700640123-beeeffce4944?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 2, 'image_url' => 'https://images.unsplash.com/photo-1614622600918-f04b86c9648f?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'display_order' => 1, 'created_at' => now()],
            // Product 3
            ['product_id' => 3, 'image_url' => 'https://images.unsplash.com/photo-1586105251261-72a756497a11', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 3, 'image_url' => 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92', 'display_order' => 1, 'created_at' => now()],
            // Product 4
            ['product_id' => 4, 'image_url' => 'https://images.unsplash.com/photo-1610701596007-11502861dcfa', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 4, 'image_url' => 'https://images.unsplash.com/photo-1580228695327-d7085dbcfd90', 'display_order' => 1, 'created_at' => now()],
            // Product 5
            ['product_id' => 5, 'image_url' => 'https://images.unsplash.com/photo-1619119069152-a2b331eb392a', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 5, 'image_url' => 'https://images.unsplash.com/photo-1623834876526-98aa086acbd8', 'display_order' => 1, 'created_at' => now()],
            // Product 6
            ['product_id' => 6, 'image_url' => 'https://images.unsplash.com/photo-1600607686527-6fb886090705', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 6, 'image_url' => 'https://images.unsplash.com/photo-1617806501553-81b547bf60bc', 'display_order' => 1, 'created_at' => now()],
            // Product 7
            ['product_id' => 7, 'image_url' => 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 7, 'image_url' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', 'display_order' => 1, 'created_at' => now()],
            // Product 8
            ['product_id' => 8, 'image_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnyUX1guXn-VOrHoLuiVZnCWTw3Pdt3u9rDA&s', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 8, 'image_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnyUX1guXn-VOrHoLuiVZnCWTw3Pdt3u9rDA&s', 'display_order' => 1, 'created_at' => now()],
            // Product 9
            ['product_id' => 9, 'image_url' => 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 9, 'image_url' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 'display_order' => 1, 'created_at' => now()],
            // Product 10
            ['product_id' => 10, 'image_url' => 'https://images.unsplash.com/photo-1505691938895-1758d7feb511', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 10, 'image_url' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f', 'display_order' => 1, 'created_at' => now()],
        ];
        foreach ($images as $image) {
            DB::table('product_images')->insert($image);
        }
    }
}
