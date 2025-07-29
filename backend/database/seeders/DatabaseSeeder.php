<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Truncate tables before seeding
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        // Add all tables that are seeded below
        DB::table('announcements')->truncate();
        DB::table('reviews')->truncate();
        DB::table('orders')->truncate();
        DB::table('product_tags')->truncate();
        DB::table('product_images')->truncate();
        DB::table('products')->truncate();
        DB::table('categories')->truncate();
        DB::table('seller_skills')->truncate();
        DB::table('sellers')->truncate();
        DB::table('users')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->call([
            UserSeeder::class,
            SellerSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            ProductImageSeeder::class,
            ProductTagSeeder::class,
            OrderSeeder::class,
            ReviewSeeder::class,
            SellerSkillSeeder::class,
            AnnouncementSeeder::class,
        ]);
    }
}
