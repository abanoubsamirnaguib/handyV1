// Mock data for the application

// Categories
export const categories = [
  { id: 'jewelry', name: 'المجوهرات', icon: 'gem' },
  { id: 'pottery', name: 'الفخار', icon: 'coffee' },
  { id: 'textiles', name: 'المنسوجات', icon: 'scissors' },
  { id: 'woodwork', name: 'أعمال الخشب', icon: 'axe' },
  { id: 'leatherwork', name: 'أعمال الجلد', icon: 'briefcase' },
  { id: 'painting', name: 'الرسم', icon: 'palette' },
  { id: 'candles', name: 'الشموع', icon: 'flame' },
  { id: 'soap', name: 'الصابون', icon: 'droplet' },
  { id: 'perfumes', name: 'عطور', icon: 'spray-can' },
  { id: 'clothes', name: 'ملابس', icon: 'shirt' },
  { id: 'tableaux', name: 'طابلوهات', icon: 'image' },
  { id: 'tatreez', name: 'تطويز', icon: 'needle' },
  { id: 'crochet', name: 'كورشية', icon: 'thread' },
  { id: 'concrete', name: 'كونكريت', icon: 'hammer' },
  { id: 'accessories', name: 'اكسسوارات', icon: 'watch' },
  { id: 'resin', name: 'ريزن', icon: 'dribbble' },
  { id: 'food', name: 'الاكل', icon: 'utensils' }
];

// Sellers
export const sellers = [
  {
    id: 's1',
    name: 'ليلى حسن',
    email: 'laila@example.com',
    avatar: '',
    bio: 'حرفية متخصصة في صناعة المجوهرات اليدوية من الفضة والأحجار الكريمة',
    rating: 4.8,
    reviewCount: 124,
    location: 'القاهرة، مصر',
    memberSince: '2020-05-15',
    skills: ['المجوهرات', 'الفضة', 'الأحجار الكريمة'],
    completedOrders: 215,
  },
  {
    id: 's2',
    name: 'كريم محمود',
    email: 'karim@example.com',
    avatar: '',
    bio: 'حرفي متخصص في النحت على الخشب وصناعة الأثاث اليدوي التقليدي',
    rating: 4.9,
    reviewCount: 89,
    location: 'الإسكندرية، مصر',
    memberSince: '2019-11-20',
    skills: ['النحت على الخشب', 'الأثاث اليدوي', 'الديكور'],
    completedOrders: 178,
  },
  {
    id: 's3',
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    avatar: '',
    bio: 'متخصصة في صناعة المنسوجات اليدوية والتطريز التقليدي',
    rating: 4.7,
    reviewCount: 156,
    location: 'أسيوط، مصر',
    memberSince: '2021-02-10',
    skills: ['المنسوجات', 'التطريز', 'الكروشيه'],
    completedOrders: 230,
  },
  {
    id: 's4',
    name: 'أحمد سمير',
    email: 'ahmed@example.com',
    avatar: '',
    bio: 'حرفي متخصص في صناعة الفخار والخزف التقليدي',
    rating: 4.6,
    reviewCount: 78,
    location: 'الفيوم، مصر',
    memberSince: '2020-08-05',
    skills: ['الفخار', 'الخزف', 'الرسم على الفخار'],
    completedOrders: 145,
  },
  {
    id: 's5',
    name: 'نور المصري',
    email: 'nour@example.com',
    avatar: '',
    bio: 'متخصصة في صناعة العطور الطبيعية والزيوت العطرية المستخلصة من نباتات محلية',
    rating: 4.9,
    reviewCount: 112,
    location: 'الأقصر، مصر',
    memberSince: '2020-01-15',
    skills: ['العطور', 'الزيوت الطبيعية', 'الاستخلاص'],
    completedOrders: 198,
  },
  {
    id: 's6',
    name: 'سارة محمد',
    email: 'sara@example.com',
    avatar: '',
    bio: 'مصممة أزياء تخصصت في تصميم وخياطة الملابس التقليدية بلمسة عصرية',
    rating: 4.8,
    reviewCount: 95,
    location: 'المنصورة، مصر',
    memberSince: '2019-09-22',
    skills: ['تصميم أزياء', 'خياطة', 'تطريز'],
    completedOrders: 167,
  },
  {
    id: 's7',
    name: 'ياسر عادل',
    email: 'yasser@example.com',
    avatar: '',
    bio: 'فنان تشكيلي متخصص في صناعة اللوحات والطابلوهات الفنية باستخدام تقنيات مختلفة',
    rating: 4.7,
    reviewCount: 88,
    location: 'أسوان، مصر',
    memberSince: '2020-06-18',
    skills: ['رسم', 'نحت', 'ديكور'],
    completedOrders: 142,
  },
  {
    id: 's8',
    name: 'هبة سليم',
    email: 'heba@example.com',
    avatar: '',
    bio: 'حرفية متخصصة في أعمال الكروشيه والحياكة اليدوية بتصاميم مبتكرة',
    rating: 4.9,
    reviewCount: 147,
    location: 'طنطا، مصر',
    memberSince: '2019-12-10',
    skills: ['كروشيه', 'حياكة', 'تصميم'],
    completedOrders: 215,
  },
  {
    id: 's9',
    name: 'عمر خالد',
    email: 'omar@example.com',
    avatar: '',
    bio: 'مهندس معماري متخصص في تصميم وتنفيذ قطع ديكور من الخرسانة (الكونكريت) بأشكال عصرية',
    rating: 4.8,
    reviewCount: 76,
    location: 'بورسعيد، مصر',
    memberSince: '2021-03-05',
    skills: ['تصميم معماري', 'كونكريت', 'ديكور منزلي'],
    completedOrders: 119,
  },
  {
    id: 's10',
    name: 'منى حسين',
    email: 'mona@example.com',
    avatar: '',
    bio: 'مصممة اكسسوارات يدوية من مواد مختلفة بتصاميم فريدة ومميزة',
    rating: 4.7,
    reviewCount: 108,
    location: 'الجيزة، مصر',
    memberSince: '2020-04-22',
    skills: ['مجوهرات', 'اكسسوارات', 'تصميم'],
    completedOrders: 187,
  },
  {
    id: 's11',
    name: 'محمد علي',
    email: 'mohamed@example.com',
    avatar: '',
    bio: 'حرفي متخصص في أعمال الريزن وصناعة القطع الفنية والديكورية باستخدام تقنيات مختلفة',
    rating: 4.9,
    reviewCount: 92,
    location: 'الإسماعيلية، مصر',
    memberSince: '2021-01-15',
    skills: ['ريزن', 'ديكور', 'فنون'],
    completedOrders: 158,
  },
  {
    id: 's12',
    name: 'رنا أحمد',
    email: 'rana@example.com',
    avatar: '',
    bio: 'طاهية متخصصة في المأكولات المصرية التقليدية والحلويات المنزلية المصنوعة بوصفات عائلية',
    rating: 4.8,
    reviewCount: 134,
    location: 'الزقازيق، مصر',
    memberSince: '2020-07-10',
    skills: ['طبخ', 'حلويات', 'وصفات تقليدية'],
    completedOrders: 226,
  }
];

// Gigs
export const gigs = [
  {
    id: 'g1',
    sellerId: 's1',
    title: 'تصميم وصناعة مجوهرات فضية مخصصة',
    description: 'أقدم حرفة تصميم وصناعة مجوهرات فضية مخصصة حسب طلبك. يمكنك اختيار التصميم والأحجار الكريمة المفضلة لديك، وسأقوم بصناعتها يدويًا بأعلى جودة.',
    price: 350,
    images: ['https://images.unsplash.com/photo-1611085583191-a3b181a88401', 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584'],
    category: 'jewelry',
    tags: ['فضة', 'مجوهرات', 'مخصص', 'هدايا'],
    rating: 4.9,
    reviewCount: 87,
    deliveryTime: '7-10 أيام',
    featured: true,
  },
  {
    id: 'g2',
    sellerId: 's2',
    title: 'نحت وزخرفة صناديق خشبية تقليدية',
    description: 'صناديق خشبية مزخرفة ومنحوتة يدويًا بتصاميم تقليدية. مثالية للهدايا أو للاستخدام كقطع ديكور منزلية. يمكن تخصيص الحجم والتصميم حسب الطلب.',
    price: 250,
    images: ['https://plus.unsplash.com/premium_photo-1677700640123-beeeffce4944?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1614622600918-f04b86c9648f?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
    category: 'woodwork',
    tags: ['خشب', 'نحت', 'صناديق', 'ديكور'],
    rating: 4.8,
    reviewCount: 62,
    deliveryTime: '10-14 يوم',
    featured: true,
  },
  {
    id: 'g3',
    sellerId: 's3',
    title: 'وسائد مطرزة يدويًا بتصاميم تراثية',
    description: 'وسائد مطرزة يدويًا بتصاميم تراثية مصرية أصيلة. مصنوعة من أجود أنواع الأقمشة وخيوط التطريز. متوفرة بألوان وأحجام مختلفة.',
    price: 180,
    images: ['https://images.unsplash.com/photo-1586105251261-72a756497a11', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92'],
    category: 'textiles',
    tags: ['تطريز', 'وسائد', 'تراثي', 'ديكور منزلي'],
    rating: 4.7,
    reviewCount: 95,
    deliveryTime: '7-10 أيام',
    featured: false,
  },
  {
    id: 'g4',
    sellerId: 's4',
    title: 'أواني فخارية مزخرفة للمطبخ والديكور',
    description: 'أواني فخارية مصنوعة ومزخرفة يدويًا. مثالية للاستخدام في المطبخ أو كقطع ديكور. متوفرة بأحجام وتصاميم مختلفة.',
    price: 220,
    images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa', 'https://images.unsplash.com/photo-1580228695327-d7085dbcfd90'],
    category: 'pottery',
    tags: ['فخار', 'أواني', 'مطبخ', 'ديكور'],
    rating: 4.6,
    reviewCount: 53,
    deliveryTime: '10-14 يوم',
    featured: false,
  },
  {
    id: 'g5',
    sellerId: 's1',
    title: 'أساور فضية مع أحجار كريمة طبيعية',
    description: 'أساور فضية مصنوعة يدويًا مع أحجار كريمة طبيعية. متوفرة بتصاميم مختلفة وأحجار متنوعة مثل العقيق والفيروز والعقيق اليماني.',
    price: 180,
    images: ['https://images.unsplash.com/photo-1619119069152-a2b331eb392a', 'https://images.unsplash.com/photo-1623834876526-98aa086acbd8'],
    category: 'jewelry',
    tags: ['فضة', 'أساور', 'أحجار كريمة', 'هدايا'],
    rating: 4.8,
    reviewCount: 71,
    deliveryTime: '5-7 أيام',
    featured: true,
  },
  {
    id: 'g6',
    sellerId: 's2',
    title: 'رفوف خشبية مزخرفة للحائط',
    description: 'رفوف خشبية مزخرفة للحائط، مصنوعة يدويًا من خشب الزان الطبيعي. مثالية لعرض القطع الصغيرة والنباتات والكتب.',
    price: 300,
    images: ['https://images.unsplash.com/photo-1600607686527-6fb886090705', 'https://images.unsplash.com/photo-1617806501553-81b547bf60bc'],
    category: 'woodwork',
    tags: ['خشب', 'رفوف', 'ديكور', 'حائط'],
    rating: 4.9,
    reviewCount: 48,
    deliveryTime: '10-14 يوم',
    featured: false,
  },
  {
    id: 'g7',
    sellerId: 's3',
    title: 'حقائب قماشية مطرزة يدويًا',
    description: 'حقائب قماشية مطرزة يدويًا بتصاميم عصرية مستوحاة من التراث. مصنوعة من القطن الطبيعي 100% ومتينة للاستخدام اليومي.',
    price: 150,
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62'],
    category: 'textiles',
    tags: ['حقائب', 'تطريز', 'قماش', 'اكسسوارات'],
    rating: 4.7,
    reviewCount: 82,
    deliveryTime: '7-10 أيام',
    featured: true,
  },
  {
    id: 'g8',
    sellerId: 's4',
    title: 'أطقم قهوة فخارية تقليدية',
    description: 'أطقم قهوة فخارية تقليدية مصنوعة ومزخرفة يدويًا. تتكون من إبريق وأكواب وصحون. مثالية للاستخدام اليومي أو كهدية مميزة.',
    price: 280,
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnyUX1guXn-VOrHoLuiVZnCWTw3Pdt3u9rDA&s', 'https://images.unsplash.com/photo-1623164152984-653fed8bcc31?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fCVEOCVCNyVEOSU4MiVEOSU4NSUyMCVEOSU4MiVEOSU4NyVEOSU4OCVEOCVBOSUyMCVEOSU4MSVEOCVBRSVEOCVBNyVEOCVCMSVEOSU4QSVEOCVBOSUyMCVEOCVBQSVEOSU4MiVEOSU4NCVEOSU4QSVEOCVBRiVEOSU4QSVEOCVBOXxlbnwwfHwwfHx8MA%3D%3D'],
    category: 'pottery',
    tags: ['فخار', 'قهوة', 'أطقم', 'هدايا'],
    rating: 4.8,
    reviewCount: 59,
    deliveryTime: '10-14 يوم',
    featured: true,
  },
  {
    id: 'g9',
    sellerId: 's5',
    title: 'عطور شرقية فاخرة مستوحاة من التراث العربي',
    description: 'عطور شرقية فاخرة مصنوعة يدويًا من مكونات طبيعية 100%. تأتي في عبوات زجاجية أنيقة ويمكن تخصيصها حسب الطلب.',
    price: 220,
    images: ['https://images.unsplash.com/photo-1621164741171-fabe4ae23141?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
    category: 'perfumes',
    tags: ['عطور', 'عطور شرقية', 'مسك', 'عنبر'],
    rating: 4.9,
    reviewCount: 78,
    deliveryTime: '5-7 أيام',
    featured: true,
  },
  {
    id: 'g10',
    sellerId: 's5',
    title: 'زيوت عطرية طبيعية للاستخدامات المختلفة',
    description: 'زيوت عطرية طبيعية مستخلصة من نباتات محلية. مناسبة للاستخدام في العلاج بالروائح، صناعة العطور، والعناية الشخصية.',
    price: 150,
    images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc'],
    category: 'perfumes',
    tags: ['زيوت عطرية', 'علاج بالروائح', 'طبيعي'],
    rating: 4.8,
    reviewCount: 64,
    deliveryTime: '3-5 أيام',
    featured: false,
  },
  {
    id: 'g11',
    sellerId: 's3',
    title: 'شموع معطرة مزخرفة يدويًا',
    description: 'شموع معطرة مزخرفة يدويًا بتصاميم فريدة ومميزة، مصنوعة من الشمع الطبيعي مع إضافة زيوت عطرية طبيعية. متوفرة بروائح وألوان متعددة.',
    price: 120,
    images: ['https://images.unsplash.com/photo-1675253326321-dcf427bed033?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fCVEOCVCNCVEOSU4NSVEOSU4OCVEOCVCOSUyMCVEOSU4NSVEOCVCOSVEOCVCNyVEOCVCMSVEOCVBOSUyMCVEOSU4NSVEOCVCMiVEOCVBRSVEOCVCMSVEOSU4MSVEOCVBOSUyMCVEOSU4QSVEOCVBRiVEOSU4OCVEOSU4QSVEOSU4QiVEOCVBN3xlbnwwfHwwfHx8MA%3D%3D'],
    category: 'candles',
    tags: ['شموع', 'ديكور', 'هدايا', 'روائح'],
    rating: 4.6,
    reviewCount: 55,
    deliveryTime: '5-7 أيام',
    featured: true,
  },
  {
    id: 'g12',
    sellerId: 's6',
    title: 'عباية مطرزة يدويًا بتصميم عصري',
    description: 'عباية مطرزة يدويًا بتصميم يجمع بين الأصالة والمعاصرة. مصنوعة من أفخم أنواع الأقمشة مع إضافات من التطريز اليدوي الأنيق.',
    price: 450,
    images: ['https://images.unsplash.com/photo-1680032195307-985a5b916dc9?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
    category: 'clothes',
    tags: ['عباية', 'ملابس', 'تطريز', 'أزياء'],
    rating: 4.9,
    reviewCount: 92,
    deliveryTime: '14-21 يوم',
    featured: true,
  },
  {
    id: 'g13',
    sellerId: 's6',
    title: 'قمصان قطنية بطباعة تراثية',
    description: 'قمصان قطنية عالية الجودة مع طباعات مستوحاة من التراث المصري القديم. متوفرة بمقاسات وألوان مختلفة للرجال والنساء.',
    price: 180,
    images: ['https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9'],
    category: 'clothes',
    tags: ['قمصان', 'ملابس', 'قطن', 'طباعة'],
    rating: 4.7,
    reviewCount: 68,
    deliveryTime: '7-10 أيام',
    featured: false,
  },
  {
    id: 'g14',
    sellerId: 's7',
    title: 'لوحات فنية مستوحاة من الحضارة المصرية',
    description: 'لوحات فنية مرسومة يدويًا مستوحاة من الحضارة المصرية القديمة. مناسبة لتزيين المنازل والمكاتب والفنادق.',
    price: 350,
    images: ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119'],
    category: 'tableaux',
    tags: ['لوحات', 'فن', 'ديكور', 'مصر القديمة'],
    rating: 4.8,
    reviewCount: 76,
    deliveryTime: '10-15 يوم',
    featured: true,
  },
  {
    id: 'g15',
    sellerId: 's7',
    title: 'طابلوهات خشبية منحوتة ثلاثية الأبعاد',
    description: 'طابلوهات خشبية منحوتة بتقنية ثلاثية الأبعاد. تصاميم فريدة ومميزة تضيف لمسة جمالية لأي مكان.',
    price: 280,
    images: ['https://images.unsplash.com/photo-1577083288073-40892c0860a4'],
    category: 'tableaux',
    tags: ['طابلوهات', 'خشب', 'نحت', 'ديكور'],
    rating: 4.7,
    reviewCount: 59,
    deliveryTime: '14-21 يوم',
    featured: false,
  },
  {
    id: 'g16',
    sellerId: 's3',
    title: 'مفارش وأغطية وسائد مطرزة بالتطريز الفلاحي',
    description: 'مفارش طاولات وأغطية وسائد مطرزة يدويًا بتقنية التطريز الفلاحي التقليدي. تصاميم أصيلة بألوان زاهية.',
    price: 220,
    images: ['https://i.pinimg.com/736x/11/45/3c/11453c037e7a3f88750f257fd435a096.jpg'],
    category: 'tatreez',
    tags: ['تطريز', 'مفارش', 'وسائد', 'تراثي'],
    rating: 4.9,
    reviewCount: 87,
    deliveryTime: '7-14 يوم',
    featured: true,
  },
  {
    id: 'g17',
    sellerId: 's8',
    title: 'بلوزات وشالات مصنوعة بالكروشيه',
    description: 'بلوزات وشالات مصنوعة يدويًا بتقنية الكروشيه. خيوط عالية الجودة وتصاميم عصرية تناسب مختلف الأذواق.',
    price: 190,
    images: ['https://m.media-amazon.com/images/I/516NOx3lyEL._AC_SY1000_.jpg'],
    category: 'crochet',
    tags: ['كروشيه', 'ملابس', 'شال', 'حياكة'],
    rating: 4.8,
    reviewCount: 74,
    deliveryTime: '10-14 يوم',
    featured: true,
  },
  {
    id: 'g18',
    sellerId: 's8',
    title: 'لعب أطفال آمنة مصنوعة بالكروشيه',
    description: 'لعب أطفال آمنة ومبهجة مصنوعة يدويًا بتقنية الكروشيه. خيوط قطنية طبيعية وحشو آمن للأطفال.',
    price: 120,
    images: ['https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d'],
    category: 'crochet',
    tags: ['كروشيه', 'ألعاب', 'أطفال', 'هدايا'],
    rating: 4.9,
    reviewCount: 92,
    deliveryTime: '7-10 أيام',
    featured: false,
  },
  {
    id: 'g19',
    sellerId: 's9',
    title: 'أحواض نباتات من الكونكريت بتصاميم هندسية',
    description: 'أحواض نباتات مصنوعة من الكونكريت بتصاميم هندسية عصرية. مناسبة للاستخدام الداخلي والخارجي.',
    price: 160,
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCiaxB32E_O_LIQ32HH3e9YnNog5o_TRkTTQ&s'],
    category: 'concrete',
    tags: ['كونكريت', 'أحواض', 'نباتات', 'ديكور'],
    rating: 4.7,
    reviewCount: 63,
    deliveryTime: '7-10 أيام',
    featured: true,
  },
  {
    id: 'g20',
    sellerId: 's9',
    title: 'حامل شموع وإكسسوارات منزلية من الكونكريت',
    description: 'حامل شموع وإكسسوارات منزلية متنوعة مصنوعة من الكونكريت بتشطيبات أنيقة. إضافة عصرية لأي مساحة منزلية.',
    price: 140,
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK9rRjutLUiOODeWQ9uN5r_LjLWkZtGaPkqg&s'],
    category: 'concrete',
    tags: ['كونكريت', 'إكسسوارات', 'ديكور', 'شموع'],
    rating: 4.6,
    reviewCount: 57,
    deliveryTime: '5-8 أيام',
    featured: false,
  },
  {
    id: 'g21',
    sellerId: 's10',
    title: 'أساور وقلائد من الخرز والأحجار الطبيعية',
    description: 'أساور وقلائد مصنوعة يدويًا من الخرز والأحجار الطبيعية. تصاميم فريدة ومميزة تناسب مختلف المناسبات.',
    price: 120,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908'],
    category: 'accessories',
    tags: ['إكسسوارات', 'مجوهرات', 'أساور', 'أحجار'],
    rating: 4.8,
    reviewCount: 85,
    deliveryTime: '3-5 أيام',
    featured: true,
  },
  {
    id: 'g22',
    sellerId: 's10',
    title: 'مسكات حقائب وإكسسوارات جلدية مزخرفة',
    description: 'مسكات حقائب وإكسسوارات جلدية مزخرفة يدويًا. مصنوعة من جلد طبيعي عالي الجودة مع إضافات معدنية أنيقة.',
    price: 180,
    images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7'],
    category: 'accessories',
    tags: ['إكسسوارات', 'جلد', 'حقائب', 'هدايا'],
    rating: 4.7,
    reviewCount: 72,
    deliveryTime: '5-7 أيام',
    featured: false,
  },
  {
    id: 'g23',
    sellerId: 's11',
    title: 'طاولات قهوة صغيرة من الريزن والخشب',
    description: 'طاولات قهوة صغيرة مصنوعة من الريزن والخشب الطبيعي. تصاميم فريدة تجمع بين الطبيعة والفن.',
    price: 550,
    images: ['https://i.ebayimg.com/thumbs/images/g/STMAAOSwqeFi8h5f/s-l500.jpg'],
    category: 'resin',
    tags: ['ريزن', 'طاولات', 'خشب', 'ديكور'],
    rating: 4.9,
    reviewCount: 68,
    deliveryTime: '14-21 يوم',
    featured: true,
  },
  {
    id: 'g24',
    sellerId: 's11',
    title: 'مجسمات وحلي من الريزن بألوان زاهية',
    description: 'مجسمات وحلي فنية مصنوعة من الريزن بألوان زاهية ومتنوعة. قطع ديكور فريدة لإضافة لمسة مميزة لمنزلك.',
    price: 180,
    images: ['https://images.unsplash.com/photo-1615484477778-ca3b77940c25'],
    category: 'resin',
    tags: ['ريزن', 'ديكور', 'حلي', 'هدايا'],
    rating: 4.7,
    reviewCount: 54,
    deliveryTime: '7-10 أيام',
    featured: false,
  },
  {
    id: 'g25',
    sellerId: 's12',
    title: 'كعك وبسكويت محشو بالتمر والمكسرات',
    description: 'كعك وبسكويت محشو بالتمر والمكسرات، مصنوع يدويًا باستخدام مكونات طبيعية 100%. مثالي للضيافة والهدايا.',
    price: 150,
    images: ['https://images.unsplash.com/photo-1646935800819-d87a744378ff?q=80&w=1528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
    category: 'food',
    tags: ['كعك', 'بسكويت', 'تمر', 'ضيافة'],
    rating: 4.9,
    reviewCount: 95,
    deliveryTime: '2-3 أيام',
    featured: true,
  },
  {
    id: 'g26',
    sellerId: 's12',
    title: 'مخبوزات تقليدية مصرية بوصفات عائلية',
    description: 'مخبوزات تقليدية مصرية معدة بوصفات عائلية متوارثة، باستخدام مكونات طازجة وطبيعية. متنوعة ومناسبة لمختلف الأذواق.',
    price: 180,
    images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a'],
    category: 'food',
    tags: ['مخبوزات', 'تقليدي', 'وصفات عائلية', 'أكل بيتي'],
    rating: 4.8,
    reviewCount: 87,
    deliveryTime: '1-2 يوم',
    featured: false,
  },
];

// Reviews
export const reviews = [
  {
    id: 'r1',
    gigId: 'g1',
    userId: 'u1',
    userName: 'سارة محمد',
    rating: 5,
    comment: 'المجوهرات رائعة جدًا وبجودة عالية. التصميم فريد والتنفيذ احترافي. سعيدة جدًا بالشراء وسأعود مرة أخرى.',
    date: '2023-08-15',
  },
  {
    id: 'r2',
    gigId: 'g1',
    userId: 'u2',
    userName: 'محمد أحمد',
    rating: 4,
    comment: 'جودة المنتج ممتازة والتصميم جميل. التسليم تأخر قليلاً عن الموعد المحدد لكن النتيجة النهائية تستحق الانتظار.',
    date: '2023-07-22',
  },
  {
    id: 'r3',
    gigId: 'g2',
    userId: 'u3',
    userName: 'نورا علي',
    rating: 5,
    comment: 'الصندوق الخشبي رائع والنحت دقيق جدًا. استخدمته كهدية وكان الجميع معجبًا به. شكرًا على العمل الرائع!',
    date: '2023-09-05',
  },
  {
    id: 'r4',
    gigId: 'g3',
    userId: 'u4',
    userName: 'أحمد محمود',
    rating: 4,
    comment: 'الوسائد جميلة جدًا والتطريز دقيق. الألوان زاهية والقماش ذو جودة عالية. أنصح بالشراء من هذا البائع.',
    date: '2023-08-30',
  },
];

// Orders
export const orders = [
  {
    id: 'o1',
    userId: 'u1',
    gigId: 'g1',
    sellerId: 's1',
    status: 'completed',
    price: 350,
    quantity: 1,
    totalPrice: 350,
    orderDate: '2023-08-10',
    deliveryDate: '2023-08-18',
    requirements: 'أريد الخاتم بمقاس 17 واللون الفضي مع حجر فيروز أزرق.',
  },
  {
    id: 'o2',
    userId: 'u2',
    gigId: 'g2',
    sellerId: 's2',
    status: 'seller_approved',
    price: 250,
    quantity: 1,
    totalPrice: 250,
    orderDate: '2023-09-05',
    deliveryDate: null,
    requirements: 'أريد الصندوق بحجم متوسط مع نقش اسم "محمد" على الغطاء.',
  },
  {
    id: 'o3',
    userId: 'u3',
    gigId: 'g3',
    sellerId: 's3',
    status: 'completed',
    price: 180,
    quantity: 2,
    totalPrice: 360,
    orderDate: '2023-07-20',
    deliveryDate: '2023-07-28',
    requirements: 'أريد الوسائد باللون الأزرق والأحمر مع تطريز ذهبي.',
  },
];

// Users
export const users = [
  {
    id: 'u1',
    name: 'سارة محمد',
    email: 'sara@example.com',
    password: 'password123',
    role: 'user',
    avatar: '',
    createdAt: '2023-01-15',
    lastLogin: '2023-09-20',
    status: 'active',
    location: 'القاهرة، مصر',
    phoneNumber: '+20123456789',
  },
  {
    id: 'u2',
    name: 'محمد أحمد',
    email: 'mohammed@example.com',
    password: 'password123',
    role: 'user',
    avatar: '',
    createdAt: '2023-02-22',
    lastLogin: '2023-09-18',
    status: 'active',
    location: 'الإسكندرية، مصر',
    phoneNumber: '+20123456790',
  },
  {
    id: 'u3',
    name: 'نورا علي',
    email: 'nora@example.com',
    password: 'password123',
    role: 'user',
    avatar: '',
    createdAt: '2023-03-10',
    lastLogin: '2023-09-15',
    status: 'active',
    location: 'عمان، الأردن',
    phoneNumber: '+9627777777',
  },
  {
    id: 'u4',
    name: 'أحمد محمود',
    email: 'ahmed@example.com',
    password: 'password123',
    role: 'user',
    avatar: '',
    createdAt: '2023-04-05',
    lastLogin: '2023-09-10',
    status: 'active',
    location: 'دبي، الإمارات',
    phoneNumber: '+9715555555',
  },
  {
    id: 'admin1',
    name: 'مدير النظام',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    avatar: '',
    createdAt: '2023-01-01',
    lastLogin: '2023-09-21',
    status: 'active',
    location: 'القاهرة، مصر',
    phoneNumber: '+20100000001',
  }
];

// Get seller by ID
export const getSellerById = (id) => {
  return sellers.find(seller => seller.id === id) || null;
};

// Get gig by ID
export const getGigById = (id) => {
  return gigs.find(gig => gig.id === id) || null;
};

// Get gigs by seller ID
export const getGigsBySellerId = (sellerId) => {
  return gigs.filter(gig => gig.sellerId === sellerId);
};

// Get reviews by gig ID
export const getReviewsByGigId = (gigId) => {
  return reviews.filter(review => review.gigId === gigId);
};

// Search gigs by query and filters
export const searchGigs = (query = '', filters = {}) => {
  let filteredGigs = [...gigs];
  
  // Search by query
  if (query) {
    const searchTerm = query.toLowerCase();
    filteredGigs = filteredGigs.filter(gig => 
      gig.title.toLowerCase().includes(searchTerm) || 
      gig.description.toLowerCase().includes(searchTerm) ||
      gig.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Filter by category
  if (filters.category) {
    filteredGigs = filteredGigs.filter(gig => gig.category === filters.category);
  }
  
  // Filter by price range
  if (filters.minPrice !== undefined) {
    filteredGigs = filteredGigs.filter(gig => gig.price >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    filteredGigs = filteredGigs.filter(gig => gig.price <= filters.maxPrice);
  }
  
  // Filter by rating
  if (filters.minRating !== undefined) {
    filteredGigs = filteredGigs.filter(gig => gig.rating >= filters.minRating);
  }
  
  // Sort results
  if (filters.sort) {
    switch (filters.sort) {
      case 'price_low':
        filteredGigs.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filteredGigs.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredGigs.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // For demo purposes, we'll just randomize
        filteredGigs.sort(() => Math.random() - 0.5);
        break;
      default:
        break;
    }
  }
  
  return filteredGigs;
};

// Search sellers by query and filters
export const searchSellers = (query = '', filters = {}) => {
  let filteredSellers = [...sellers];
  
  // Search by query
  if (query) {
    const searchTerm = query.toLowerCase();
    filteredSellers = filteredSellers.filter(seller => 
      seller.name.toLowerCase().includes(searchTerm) || 
      seller.bio.toLowerCase().includes(searchTerm) ||
      seller.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
  }
  
  // Filter by category/skill
  if (filters.category) {
    filteredSellers = filteredSellers.filter(seller => 
      seller.skills.some(skill => {
        // Map category ID to a relevant skill term
        const categoryMap = {
          'jewelry': ['مجوهرات', 'الفضة', 'الأحجار'],
          'pottery': ['الفخار', 'الخزف'],
          'textiles': ['المنسوجات', 'التطريز'],
          'woodwork': ['خشب', 'النحت على الخشب'],
          'leatherwork': ['جلد', 'أعمال الجلد'],
          'painting': ['رسم', 'لوحات'],
          'candles': ['شموع'],
          'soap': ['صابون'],
          'perfumes': ['عطور', 'الزيوت الطبيعية'],
          'clothes': ['ملابس', 'خياطة', 'تصميم أزياء'],
          'tableaux': ['لوحات', 'طابلوهات'],
          'tatreez': ['تطريز', 'تطويز'],
          'crochet': ['كروشيه', 'حياكة'],
          'concrete': ['كونكريت'],
          'accessories': ['اكسسوارات', 'مجوهرات'],
          'resin': ['ريزن'],
          'food': ['طبخ', 'حلويات', 'وصفات']
        };
        
        // Check if any of the category-related skills match the seller's skills
        const relatedTerms = categoryMap[filters.category] || [];
        return relatedTerms.some(term => skill.toLowerCase().includes(term.toLowerCase()));
      })
    );
  }
  
  // Filter by rating
  if (filters.minRating !== undefined) {
    filteredSellers = filteredSellers.filter(seller => seller.rating >= filters.minRating);
  }
  
  // Sort results
  if (filters.sort) {
    switch (filters.sort) {
      case 'rating':
        filteredSellers.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        filteredSellers.sort((a, b) => b.completedOrders - a.completedOrders);
        break;
      case 'newest':
        // For demo purposes, we'll sort by memberSince date
        filteredSellers.sort((a, b) => new Date(b.memberSince) - new Date(a.memberSince));
        break;
      default:
        break;
    }
  }
  
  return filteredSellers;
};
