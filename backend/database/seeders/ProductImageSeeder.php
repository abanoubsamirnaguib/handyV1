<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        $images = [
            // g1
            ['product_id' => 'g1', 'image_url' => 'https://images.unsplash.com/photo-1611085583191-a3b181a88401', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g1', 'image_url' => 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584', 'display_order' => 1, 'created_at' => now()],
            // g2
            ['product_id' => 'g2', 'image_url' => 'https://plus.unsplash.com/premium_photo-1677700640123-beeeffce4944?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g2', 'image_url' => 'https://images.unsplash.com/photo-1614622600918-f04b86c9648f?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'display_order' => 1, 'created_at' => now()],
            // g3
            ['product_id' => 'g3', 'image_url' => 'https://images.unsplash.com/photo-1586105251261-72a756497a11', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g3', 'image_url' => 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92', 'display_order' => 1, 'created_at' => now()],
            // g4
            ['product_id' => 'g4', 'image_url' => 'https://images.unsplash.com/photo-1610701596007-11502861dcfa', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g4', 'image_url' => 'https://images.unsplash.com/photo-1580228695327-d7085dbcfd90', 'display_order' => 1, 'created_at' => now()],
            // g5
            ['product_id' => 'g5', 'image_url' => 'https://images.unsplash.com/photo-1619119069152-a2b331eb392a', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g5', 'image_url' => 'https://images.unsplash.com/photo-1623834876526-98aa086acbd8', 'display_order' => 1, 'created_at' => now()],
            // g6
            ['product_id' => 'g6', 'image_url' => 'https://images.unsplash.com/photo-1600607686527-6fb886090705', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g6', 'image_url' => 'https://images.unsplash.com/photo-1617806501553-81b547bf60bc', 'display_order' => 1, 'created_at' => now()],
            // g7
            ['product_id' => 'g7', 'image_url' => 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g7', 'image_url' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', 'display_order' => 1, 'created_at' => now()],
            // g8
            ['product_id' => 'g8', 'image_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnyUX1guXn-VOrHoLuiVZnCWTw3Pdt3u9rDA&s', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g8', 'image_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnyUX1guXn-VOrHoLuiVZnCWTw3Pdt3u9rDA&s', 'display_order' => 1, 'created_at' => now()],
            // g9
            ['product_id' => 'g9', 'image_url' => 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g9', 'image_url' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 'display_order' => 1, 'created_at' => now()],
            // g10
            ['product_id' => 'g10', 'image_url' => 'https://images.unsplash.com/photo-1505691938895-1758d7feb511', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g10', 'image_url' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f', 'display_order' => 1, 'created_at' => now()],
            // g11
            ['product_id' => 'g11', 'image_url' => 'https://images.unsplash.com/photo-1588854337236-6889d631faa8', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g11', 'image_url' => 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461', 'display_order' => 1, 'created_at' => now()],
            // g12
            ['product_id' => 'g12', 'image_url' => 'https://images.unsplash.com/photo-1533090481720-856c6e7c1fdc', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g12', 'image_url' => 'https://images.unsplash.com/photo-1554995207-c18c203602cb', 'display_order' => 1, 'created_at' => now()],
            // g13
            ['product_id' => 'g13', 'image_url' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g13', 'image_url' => 'https://images.unsplash.com/photo-1576656894220-35a3edc2ea5a', 'display_order' => 1, 'created_at' => now()],
            // g14
            ['product_id' => 'g14', 'image_url' => 'https://images.unsplash.com/photo-1594402960619-700a1a9ad381', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g14', 'image_url' => 'https://images.unsplash.com/photo-1600585152220-90363fe7e115', 'display_order' => 1, 'created_at' => now()],
            // g15
            ['product_id' => 'g15', 'image_url' => 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g15', 'image_url' => 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e', 'display_order' => 1, 'created_at' => now()],
            // g16
            ['product_id' => 'g16', 'image_url' => 'https://images.unsplash.com/photo-1616046229478-9901c5536a45', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 'g16', 'image_url' => 'https://images.unsplash.com/photo-1615874959474-d609969a20ed', 'display_order' => 1, 'created_at' => now()],
        ];
        foreach ($images as $img) {
            DB::table('product_images')->insert($img);
        }
    }
}
