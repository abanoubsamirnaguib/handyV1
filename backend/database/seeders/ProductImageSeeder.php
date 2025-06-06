<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
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
            ['product_id' => 8, 'image_url' => 'https://images.unsplash.com/photo-1610701596007-11502861dcfa', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 8, 'image_url' => 'https://images.unsplash.com/photo-1623164152984-653fed8bcc31', 'display_order' => 1, 'created_at' => now()],
            // Product 9
            ['product_id' => 9, 'image_url' => 'https://images.unsplash.com/photo-1621164741171-fabe4ae23141', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 9, 'image_url' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 'display_order' => 1, 'created_at' => now()],
            // Product 10
            ['product_id' => 10, 'image_url' => 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 10, 'image_url' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f', 'display_order' => 1, 'created_at' => now()],
            // Product 11
            ['product_id' => 11, 'image_url' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 11, 'image_url' => 'https://images.unsplash.com/photo-1602874207573-9185edefa204', 'display_order' => 1, 'created_at' => now()],
            // Product 12
            ['product_id' => 12, 'image_url' => 'https://images.unsplash.com/photo-1680032195307-985a5b916dc9', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 12, 'image_url' => 'https://images.unsplash.com/photo-1631234764568-593ebd4d6e2f', 'display_order' => 1, 'created_at' => now()],
            // Product 13
            ['product_id' => 13, 'image_url' => 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 13, 'image_url' => 'https://images.unsplash.com/photo-1562157873-818bc0726f68', 'display_order' => 1, 'created_at' => now()],
            // Product 14
            ['product_id' => 14, 'image_url' => 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 14, 'image_url' => 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa', 'display_order' => 1, 'created_at' => now()],
            // Product 15
            ['product_id' => 15, 'image_url' => 'https://images.unsplash.com/photo-1577083288073-40892c0860a4', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 15, 'image_url' => 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38', 'display_order' => 1, 'created_at' => now()],
            // Product 16
            ['product_id' => 16, 'image_url' => 'https://i.pinimg.com/736x/11/45/3c/11453c037e7a3f88750f257fd435a096.jpg', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 16, 'image_url' => 'https://i.etsystatic.com/16651191/r/il/9bb14c/3420039768/il_fullxfull.3420039768_f9ff.jpg', 'display_order' => 1, 'created_at' => now()],
            // Product 17
            ['product_id' => 17, 'image_url' => 'https://m.media-amazon.com/images/I/516NOx3lyEL._AC_SY1000_.jpg', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 17, 'image_url' => 'https://www.crochetspot.com/wp-content/uploads/2016/05/crochet-pattern-light-summer-poncho-1.jpg', 'display_order' => 1, 'created_at' => now()],
            // Product 18
            ['product_id' => 18, 'image_url' => 'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 18, 'image_url' => 'https://i.etsystatic.com/25587460/r/il/160953/3375258523/il_fullxfull.3375258523_81s0.jpg', 'display_order' => 1, 'created_at' => now()],
            // Product 19
            ['product_id' => 19, 'image_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCiaxB32E_O_LIQ32HH3e9YnNog5o_TRkTTQ&s', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 19, 'image_url' => 'https://cdn.shopify.com/s/files/1/0280/6463/0156/products/concrete-plant-pot-large-concrete-planters-flowerpots-and-planters-gray-cement-pot_530x@2x.jpg', 'display_order' => 1, 'created_at' => now()],
            // Product 20
            ['product_id' => 20, 'image_url' => 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK9rRjutLUiOODeWQ9uN5r_LjLWkZtGaPkqg&s', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 20, 'image_url' => 'https://cdn.shopify.com/s/files/1/0204/5729/products/concrete_candle_holder_trio_1200x.jpg', 'display_order' => 1, 'created_at' => now()],
            // Product 21
            ['product_id' => 21, 'image_url' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 21, 'image_url' => 'https://images.unsplash.com/photo-1602173574767-37ac01994b2c', 'display_order' => 1, 'created_at' => now()],
            // Product 22
            ['product_id' => 22, 'image_url' => 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 22, 'image_url' => 'https://images.unsplash.com/photo-1601924921557-45e6dea0a157', 'display_order' => 1, 'created_at' => now()],
            // Product 23
            ['product_id' => 23, 'image_url' => 'https://i.ebayimg.com/thumbs/images/g/STMAAOSwqeFi8h5f/s-l500.jpg', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 23, 'image_url' => 'https://i.etsystatic.com/27131285/r/il/01ae03/2808206335/il_fullxfull.2808206335_o9by.jpg', 'display_order' => 1, 'created_at' => now()],
            // Product 24
            ['product_id' => 24, 'image_url' => 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 24, 'image_url' => 'https://i.etsystatic.com/15168108/r/il/af907e/4615878762/il_fullxfull.4615878762_qvm4.jpg', 'display_order' => 1, 'created_at' => now()],
            // Product 25
            ['product_id' => 25, 'image_url' => 'https://images.unsplash.com/photo-1646935800819-d87a744378ff', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 25, 'image_url' => 'https://images.unsplash.com/photo-1631377307429-10daeffb3b4d', 'display_order' => 1, 'created_at' => now()],
            // Product 26
            ['product_id' => 26, 'image_url' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a', 'display_order' => 0, 'created_at' => now()],
            ['product_id' => 26, 'image_url' => 'https://images.unsplash.com/photo-1606101273945-e05f0a50ebd0', 'display_order' => 1, 'created_at' => now()],
        ];

        foreach ($images as $image) {
            DB::table('product_images')->insert($image);
        }
    }
}
