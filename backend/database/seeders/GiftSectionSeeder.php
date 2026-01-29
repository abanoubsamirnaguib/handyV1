<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\GiftSection;

class GiftSectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sections = [
            [
                'title' => 'هدايا رمضان',
                'tags' => ['رمضان', 'هدايا', 'رمضانية'],
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'هدايا الأعياد',
                'tags' => ['عيد', 'أعياد', 'احتفال', 'هدايا'],
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'منتجات يدوية',
                'tags' => ['يدوي', 'حرفي', 'صناعة يدوية'],
                'display_order' => 3,
                'is_active' => true,
            ],
            [
                'title' => 'هدايا الأطفال',
                'tags' => ['أطفال', 'ألعاب', 'طفل'],
                'display_order' => 4,
                'is_active' => true,
            ],
            [
                'title' => 'إكسسوارات',
                'tags' => ['إكسسوار', 'حلي', 'زينة'],
                'display_order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($sections as $section) {
            GiftSection::create($section);
        }
    }
}
