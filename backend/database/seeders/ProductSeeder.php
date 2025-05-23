<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'id' => 'g1',
                'seller_id' => 's1',
                'title' => 'تصميم وصناعة مجوهرات فضية مخصصة',
                'description' => 'أقدم خدمة تصميم وصناعة مجوهرات فضية مخصصة حسب طلبك. يمكنك اختيار التصميم والأحجار الكريمة المفضلة لديك، وسأقوم بصناعتها يدويًا بأعلى جودة.',
                'price' => 350,
                'category_id' => 'jewelry',
                'delivery_time' => '7-10 أيام',
                'rating' => 4.9,
                'review_count' => 87,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g2',
                'seller_id' => 's2',
                'title' => 'نحت وزخرفة صناديق خشبية تقليدية',
                'description' => 'صناديق خشبية مزخرفة ومنحوتة يدويًا بتصاميم تقليدية. مثالية للهدايا أو للاستخدام كقطع ديكور منزلية. يمكن تخصيص الحجم والتصميم حسب الطلب.',
                'price' => 250,
                'category_id' => 'woodwork',
                'delivery_time' => '10-14 يوم',
                'rating' => 4.8,
                'review_count' => 62,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g3',
                'seller_id' => 's3',
                'title' => 'وسائد مطرزة يدويًا بتصاميم تراثية',
                'description' => 'وسائد مطرزة يدويًا بتصاميم تراثية مصرية أصيلة. مصنوعة من أجود أنواع الأقمشة وخيوط التطريز. متوفرة بألوان وأحجام مختلفة.',
                'price' => 180,
                'category_id' => 'textiles',
                'delivery_time' => '7-10 أيام',
                'rating' => 4.7,
                'review_count' => 95,
                'featured' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g4',
                'seller_id' => 's4',
                'title' => 'أواني فخارية مزخرفة للمطبخ والديكور',
                'description' => 'أواني فخارية مصنوعة ومزخرفة يدويًا. مثالية للاستخدام في المطبخ أو كقطع ديكور. متوفرة بأحجام وتصاميم مختلفة.',
                'price' => 220,
                'category_id' => 'pottery',
                'delivery_time' => '10-14 يوم',
                'rating' => 4.6,
                'review_count' => 53,
                'featured' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g5',
                'seller_id' => 's1',
                'title' => 'أساور فضية مع أحجار كريمة طبيعية',
                'description' => 'أساور فضية مصنوعة يدويًا مع أحجار كريمة طبيعية. متوفرة بتصاميم مختلفة وأحجار متنوعة مثل العقيق والفيروز والعقيق اليماني.',
                'price' => 180,
                'category_id' => 'jewelry',
                'delivery_time' => '5-7 أيام',
                'rating' => 4.8,
                'review_count' => 71,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g6',
                'seller_id' => 's2',
                'title' => 'رفوف خشبية مزخرفة للحائط',
                'description' => 'رفوف خشبية مزخرفة للحائط، مصنوعة يدويًا من خشب الزان الطبيعي. مثالية لعرض القطع الصغيرة والنباتات والكتب.',
                'price' => 300,
                'category_id' => 'woodwork',
                'delivery_time' => '10-14 يوم',
                'rating' => 4.9,
                'review_count' => 48,
                'featured' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g7',
                'seller_id' => 's3',
                'title' => 'حقائب قماشية مطرزة يدويًا',
                'description' => 'حقائب قماشية مطرزة يدويًا بتصاميم عصرية مستوحاة من التراث. مصنوعة من القطن الطبيعي 100% ومتينة للاستخدام اليومي.',
                'price' => 150,
                'category_id' => 'textiles',
                'delivery_time' => '7-10 أيام',
                'rating' => 4.7,
                'review_count' => 82,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g8',
                'seller_id' => 's4',
                'title' => 'أطقم قهوة فخارية تقليدية',
                'description' => 'أطقم قهوة فخارية تقليدية مصنوعة ومزخرفة يدويًا. تتكون من إبريق وأكواب وصحون. مثالية للاستخدام اليومي أو كهدية مميزة.',
                'price' => 280,
                'category_id' => 'pottery',
                'delivery_time' => '10-14 يوم',
                'rating' => 4.8,
                'review_count' => 59,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g9',
                'seller_id' => 's5',
                'title' => 'عطور شرقية فاخرة مستوحاة من التراث العربي',
                'description' => 'عطور شرقية فاخرة مصنوعة يدويًا من مكونات طبيعية 100%. تأتي في عبوات زجاجية أنيقة ويمكن تخصيصها حسب الطلب.',
                'price' => 220,
                'category_id' => 'perfumes',
                'delivery_time' => '5-7 أيام',
                'rating' => 4.9,
                'review_count' => 78,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g10',
                'seller_id' => 's5',
                'title' => 'زيوت عطرية طبيعية للاستخدامات المختلفة',
                'description' => 'زيوت عطرية طبيعية مستخلصة من نباتات محلية. مناسبة للاستخدام في العلاج بالروائح، صناعة العطور، والعناية الشخصية.',
                'price' => 150,
                'category_id' => 'perfumes',
                'delivery_time' => '3-5 أيام',
                'rating' => 4.8,
                'review_count' => 64,
                'featured' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g11',
                'seller_id' => 's3',
                'title' => 'شموع معطرة مزخرفة يدويًا',
                'description' => 'شموع معطرة مزخرفة يدويًا بتصاميم فريدة ومميزة، مصنوعة من الشمع الطبيعي مع إضافة زيوت عطرية طبيعية. متوفرة بروائح وألوان متعددة.',
                'price' => 120,
                'category_id' => 'candles',
                'delivery_time' => '5-7 أيام',
                'rating' => 4.6,
                'review_count' => 55,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g12',
                'seller_id' => 's6',
                'title' => 'عباية مطرزة يدويًا بتصميم عصري',
                'description' => 'عباية مطرزة يدويًا بتصميم يجمع بين الأصالة والمعاصرة. مصنوعة من أفخم أنواع الأقمشة مع إضافات من التطريز اليدوي الأنيق.',
                'price' => 450,
                'category_id' => 'clothes',
                'delivery_time' => '14-21 يوم',
                'rating' => 4.9,
                'review_count' => 92,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g13',
                'seller_id' => 's6',
                'title' => 'قمصان قطنية بطباعة تراثية',
                'description' => 'قمصان قطنية عالية الجودة مع طباعات مستوحاة من التراث المصري القديم. متوفرة بمقاسات وألوان مختلفة للرجال والنساء.',
                'price' => 180,
                'category_id' => 'clothes',
                'delivery_time' => '7-10 أيام',
                'rating' => 4.7,
                'review_count' => 68,
                'featured' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g14',
                'seller_id' => 's7',
                'title' => 'لوحات فنية مستوحاة من الحضارة المصرية',
                'description' => 'لوحات فنية مرسومة يدويًا مستوحاة من الحضارة المصرية القديمة. مناسبة لتزيين المنازل والمكاتب والفنادق.',
                'price' => 350,
                'category_id' => 'tableaux',
                'delivery_time' => '10-15 يوم',
                'rating' => 4.8,
                'review_count' => 76,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g15',
                'seller_id' => 's7',
                'title' => 'طابلوهات خشبية منحوتة ثلاثية الأبعاد',
                'description' => 'طابلوهات خشبية منحوتة بتقنية ثلاثية الأبعاد. تصاميم فريدة ومميزة تضيف لمسة جمالية لأي مكان.',
                'price' => 280,
                'category_id' => 'tableaux',
                'delivery_time' => '14-21 يوم',
                'rating' => 4.7,
                'review_count' => 59,
                'featured' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g16',
                'seller_id' => 's3',
                'title' => 'مفارش وأغطية وسائد مطرزة بالتطريز الفلاحي',
                'description' => 'مفارش طاولات وأغطية وسائد مطرزة يدويًا بتقنية التطريز الفلاحي التقليدي. تصاميم أصيلة بألوان زاهية.',
                'price' => 220,
                'category_id' => 'tatreez',
                'delivery_time' => '7-14 يوم',
                'rating' => 4.9,
                'review_count' => 87,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g17',
                'seller_id' => 's8',
                'title' => 'بلوزات وشالات مصنوعة بالكروشيه',
                'description' => 'بلوزات وشالات مصنوعة يدويًا بتقنية الكروشيه. خيوط عالية الجودة وتصاميم عصرية تناسب مختلف الأذواق.',
                'price' => 190,
                'category_id' => 'crochet',
                'delivery_time' => '10-14 يوم',
                'rating' => 4.8,
                'review_count' => 74,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g18',
                'seller_id' => 's8',
                'title' => 'لعب أطفال آمنة مصنوعة بالكروشيه',
                'description' => 'لعب أطفال آمنة ومبهجة مصنوعة يدويًا بتقنية الكروشيه. خيوط قطنية طبيعية وحشو آمن للأطفال.',
                'price' => 120,
                'category_id' => 'crochet',
                'delivery_time' => '7-10 أيام',
                'rating' => 4.9,
                'review_count' => 92,
                'featured' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g19',
                'seller_id' => 's9',
                'title' => 'أحواض نباتات من الكونكريت بتصاميم هندسية',
                'description' => 'أحواض نباتات مصنوعة من الكونكريت بتصاميم هندسية عصرية. مناسبة للاستخدام الداخلي والخارجي.',
                'price' => 160,
                'category_id' => 'concrete',
                'delivery_time' => '7-10 أيام',
                'rating' => 4.7,
                'review_count' => 63,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g20',
                'seller_id' => 's9',
                'title' => 'حامل شموع وإكسسوارات منزلية من الكونكريت',
                'description' => 'حامل شموع وإكسسوارات منزلية متنوعة مصنوعة من الكونكريت بتشطيبات أنيقة. إضافة عصرية لأي مساحة منزلية.',
                'price' => 140,
                'category_id' => 'concrete',
                'delivery_time' => '5-8 أيام',
                'rating' => 4.6,
                'review_count' => 57,
                'featured' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g21',
                'seller_id' => 's10',
                'title' => 'أساور وقلائد من الخرز والأحجار الطبيعية',
                'description' => 'أساور وقلائد مصنوعة يدويًا من الخرز والأحجار الطبيعية. تصاميم فريدة ومميزة تناسب مختلف المناسبات.',
                'price' => 120,
                'category_id' => 'accessories',
                'delivery_time' => '3-5 أيام',
                'rating' => 4.8,
                'review_count' => 85,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g22',
                'seller_id' => 's10',
                'title' => 'مسكات حقائب وإكسسوارات جلدية مزخرفة',
                'description' => 'مسكات حقائب وإكسسوارات جلدية مزخرفة يدويًا. مصنوعة من جلد طبيعي عالي الجودة مع إضافات معدنية أنيقة.',
                'price' => 180,
                'category_id' => 'accessories',
                'delivery_time' => '5-7 أيام',
                'rating' => 4.7,
                'review_count' => 72,
                'featured' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g23',
                'seller_id' => 's11',
                'title' => 'طاولات قهوة صغيرة من الريزن والخشب',
                'description' => 'طاولات قهوة صغيرة مصنوعة من الريزن والخشب الطبيعي. تصاميم فريدة تجمع بين الطبيعة والفن.',
                'price' => 550,
                'category_id' => 'resin',
                'delivery_time' => '14-21 يوم',
                'rating' => 4.9,
                'review_count' => 68,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g24',
                'seller_id' => 's11',
                'title' => 'مجسمات وحلي من الريزن بألوان زاهية',
                'description' => 'مجسمات وحلي فنية مصنوعة من الريزن بألوان زاهية ومتنوعة. قطع ديكور فريدة لإضافة لمسة مميزة لمنزلك.',
                'price' => 180,
                'category_id' => 'resin',
                'delivery_time' => '7-10 أيام',
                'rating' => 4.7,
                'review_count' => 54,
                'featured' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g25',
                'seller_id' => 's12',
                'title' => 'كعك وبسكويت محشو بالتمر والمكسرات',
                'description' => 'كعك وبسكويت محشو بالتمر والمكسرات، مصنوع يدويًا باستخدام مكونات طبيعية 100%. مثالي للضيافة والهدايا.',
                'price' => 150,
                'category_id' => 'food',
                'delivery_time' => '2-3 أيام',
                'rating' => 4.9,
                'review_count' => 95,
                'featured' => true,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 'g26',
                'seller_id' => 's12',
                'title' => 'مخبوزات تقليدية مصرية بوصفات عائلية',
                'description' => 'مخبوزات تقليدية مصرية معدة بوصفات عائلية متوارثة، باستخدام مكونات طازجة وطبيعية. متنوعة ومناسبة لمختلف الأذواق.',
                'price' => 180,
                'category_id' => 'food',
                'delivery_time' => '1-2 يوم',
                'rating' => 4.8,
                'review_count' => 87,
                'featured' => false,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        foreach ($products as $product) {
            DB::table('products')->insert($product);
        }
    }
}
