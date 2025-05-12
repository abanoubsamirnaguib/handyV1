<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $orders = [
            [
                'id' => 'o1',
                'user_id' => 'u1',
                'seller_id' => 's1',
                'status' => 'completed',
                'total_price' => 350,
                'order_date' => '2023-08-10',
                'delivery_date' => '2023-08-18',
                'requirements' => 'أريد الخاتم بمقاس 17 واللون الفضي مع حجر فيروز أزرق.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'o2',
                'user_id' => 'u2',
                'seller_id' => 's2',
                'status' => 'in_progress',
                'total_price' => 250,
                'order_date' => '2023-09-05',
                'delivery_date' => null,
                'requirements' => 'أريد الصندوق بحجم متوسط مع نقش اسم "محمد" على الغطاء.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'o3',
                'user_id' => 'u3',
                'seller_id' => 's3',
                'status' => 'completed',
                'total_price' => 360,
                'order_date' => '2023-07-20',
                'delivery_date' => '2023-07-28',
                'requirements' => 'أريد الوسائد باللون الأزرق والأحمر مع تطريز ذهبي.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        foreach ($orders as $order) {
            DB::table('orders')->insert($order);
        }
    }
}
