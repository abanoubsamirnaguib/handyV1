import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  Globe, 
  Award, 
  Palette, 
  UserCheck,
  Star,
  Mail,
  Phone,
  MapPin,
  Target,
  Eye,
  Lightbulb,
  Shield,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';

const AboutUsPage = () => {
  const [stats, setStats] = useState([
    { number: "0", label: "حرفي موثوق", icon: Users },
    { number: "0", label: "منتج يدوي", icon: Palette },
    { number: "0", label: "عميل راضي", icon: Star },
    { number: "0", label: "تصنيف متنوع", icon: Globe }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getAboutUsStats();
        if (response.success) {
          const data = response.data;
          setStats([
            { 
              number: data.trusted_artisans > 0 ? `${data.trusted_artisans}+` : "0", 
              label: "حرفي موثوق", 
              icon: Users 
            },
            { 
              number: data.handmade_products > 0 ? `${data.handmade_products}+` : "0", 
              label: "منتج يدوي", 
              icon: Palette 
            },
            { 
              number: data.satisfied_customers > 0 ? `${data.satisfied_customers}+` : "0", 
              label: "عميل راضي", 
              icon: Star 
            },
            { 
              number: data.diverse_categories > 0 ? `${data.diverse_categories}+` : "0", 
              label: "تصنيف متنوع", 
              icon: Globe 
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching about us stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const values = [
    {
      title: "الجودة والإتقان",
      description: "نؤمن بأن كل قطعة يدوية تحمل روح صانعها ولمسة الإبداع الحقيقي",
      icon: Award,
      color: "olivePrimary"
    },
    {
      title: "دعم الحرفيين",
      description: "نوفر منصة عادلة تمكن الحرفيين من عرض إبداعاتهم والوصول لجمهور أوسع",
      icon: UserCheck,
      color: "burntOrange"
    },
    {
      title: "الأصالة والتراث",
      description: "نحافظ على التراث المصري العريق ونقدمه بثوب عصري يناسب الأجيال الجديدة",
      icon: Heart,
      color: "brightOrange"
    }
  ];

  const features = [
    {
      title: "منتجات يدوية أصلية 100%",
      icon: Palette,
      color: "olivePrimary"
    },
    {
      title: "جودة مضمونة وحرفية عالية",
      icon: Award,
      color: "burntOrange"
    },
    {
      title: "صنع بحب وشغف حقيقي",
      icon: Heart,
      color: "brightOrange"
    },
    {
      title: "دعم فني متواصل",
      icon: Shield,
      color: "peachOrange"
    }
  ];

  const team = [
    {
      name: "أحمد محمد",
      role: "مؤسس ومدير عام",
      description: "خبير في التجارة الإلكترونية مع شغف بدعم الحرفيين المصريين",
      color: "olivePrimary"
    },
    {
      name: "فاطمة أحمد",
      role: "مديرة المنتجات",
      description: "متخصصة في تطوير المنتجات مع خلفية في الفنون والحرف اليدوية",
      color: "burntOrange"
    },
    {
      name: "محمود علي",
      role: "مدير التكنولوجيا",
      description: "مطور برامج محترف يهتم بإنشاء حلول تقنية مبتكرة",
      color: "brightOrange"
    }
  ];

  return (
    <div className="min-h-screen bg-lightBeige" dir="rtl">
      {/* Hero Section */}
      <div className="bg-olivePrimary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-darkOlive/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
        
        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              من نحن
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-white/90 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              منصة <strong className="text-creamyBeige">بازار</strong> هي المكان الذي يجمع بين الحرفيين المبدعين والعملاء الباحثين عن الأصالة والجودة. 
              نؤمن بقوة الإبداع اليدوي ونسعى لإحياء التراث المصري العريق في ثوب عصري جديد.
            </motion.p>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Vision & Mission Section */}
        <motion.div 
          className="grid grid-cols-1 xl:grid-cols-2 gap-12 mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Vision Card */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-paleGreen relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-paleGreen rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10 text-center">
                <div className="bg-olivePrimary p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Eye className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-darkOlive mb-6">رؤيتنا</h3>
                <p className="text-darkBrown leading-relaxed text-lg">
                  أن نكون المنصة الرائدة في الشرق الأوسط لتسويق المنتجات اليدوية والحرف التراثية، 
                  ونصبح الجسر الذي يربط بين الماضي العريق والحاضر المبدع.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-paleGreen relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-32 h-32 bg-creamyBeige rounded-full -translate-y-16 -translate-x-16"></div>
              <div className="relative z-10 text-center">
                <div className="bg-burntOrange p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-darkOlive mb-6">مهمتنا</h3>
                <p className="text-darkBrown leading-relaxed text-lg">
                  تمكين الحرفيين المصريين من عرض وبيع منتجاتهم اليدوية الفريدة، 
                  وتوفير تجربة تسوق مميزة للعملاء الذين يقدرون الفن والإبداع الحقيقي.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-darkOlive mb-4">إنجازاتنا بالأرقام</h3>
            <p className="text-xl text-darkBrown">أرقام تعكس ثقة عملائنا وشركائنا</p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-paleGreen">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-lightBeige rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <div className={`bg-${index % 2 === 0 ? 'olivePrimary' : 'burntOrange'} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`text-3xl font-bold text-${index % 2 === 0 ? 'olivePrimary' : 'burntOrange'} mb-2`}>
                      {loading ? (
                        <div className="animate-pulse bg-paleGreen h-8 w-16 mx-auto rounded"></div>
                      ) : (
                        stat.number
                      )}
                    </div>
                    <div className="text-darkBrown font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div 
          className="mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-darkOlive mb-4">قيمنا ومبادئنا</h3>
            <p className="text-xl text-darkBrown">المبادئ التي توجه عملنا وتحدد هويتنا</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-2 border-paleGreen hover:border-olivePrimary/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className={`bg-${value.color} p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <value.icon className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-darkOlive mb-4">{value.title}</h4>
                    <p className="text-darkBrown leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features & Art Section */}
        <motion.div 
          className="mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-darkOlive mb-4">شغفنا بالفن والإبداع</h3>
            <p className="text-xl text-darkBrown">ما يميزنا ويجعلنا خيارك الأول</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-paleGreen">
              <p className="text-lg text-darkBrown leading-relaxed mb-8">
                في بازار، نؤمن بأن كل قطعة يدوية تحكي قصة. قصة الحرفي الذي أبدعها، قصة التراث الذي تحمله، 
                وقصة الحب والشغف الذي وُضع فيها. نحن لسنا مجرد منصة تجارية، بل مجتمع يقدر الفن الحقيقي.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3 space-x-reverse p-4 bg-lightBeige rounded-xl"
                    whileHover={{ x: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`bg-${feature.color} p-2 rounded-lg`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-darkOlive font-medium">{feature.title}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <motion.div 
                  className="bg-olivePrimary/20 rounded-2xl h-40 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Palette className="h-16 w-16 text-olivePrimary" />
                </motion.div>
                <motion.div 
                  className="bg-burntOrange/20 rounded-2xl h-32 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Heart className="h-12 w-12 text-burntOrange" />
                </motion.div>
              </div>
              <div className="space-y-6 mt-8">
                <motion.div 
                  className="bg-lightGreen/30 rounded-2xl h-32 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Award className="h-12 w-12 text-olivePrimary" />
                </motion.div>
                <motion.div 
                  className="bg-creamyBeige rounded-2xl h-40 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Users className="h-16 w-16 text-darkOlive" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div 
          className="mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-darkOlive mb-4">فريق العمل</h3>
            <p className="text-xl text-darkBrown">الأشخاص الذين يجعلون أحلامنا حقيقة</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-2 border-paleGreen hover:border-olivePrimary/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className={`bg-${member.color} p-4 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <Users className="h-12 w-12 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-darkOlive mb-2">{member.name}</h4>
                    <p className={`text-${member.color} font-medium mb-4`}>{member.role}</p>
                    <p className="text-darkBrown text-sm leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-creamyBeige rounded-3xl transform rotate-1"></div>
          
          {/* Main Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl border border-paleGreen overflow-hidden">
            {/* Header */}
            <div className="bg-olivePrimary p-8 relative">
              <div className="absolute top-0 left-0 w-full h-full bg-darkOlive/20"></div>
              <div className="relative z-10 text-center">
                <Heart className="h-12 w-12 text-white mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">تواصل معنا</h3>
                <p className="text-white/90 text-lg">نحن دائماً هنا للاستماع إليك</p>
              </div>
            </div>

            {/* Contact Content */}
            <div className="p-8">
              <p className="text-darkBrown mb-8 text-center text-lg leading-relaxed max-w-2xl mx-auto">
                إذا كان لديك أي استفسار أو تريد الانضمام إلى مجتمع الحرفيين لدينا، 
                لا تتردد في التواصل معنا.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <motion.div 
                  className="flex flex-col items-center space-y-3 p-6 bg-lightBeige rounded-2xl"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-olivePrimary p-3 rounded-full">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-darkOlive font-semibold">support@bazaar.com</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center space-y-3 p-6 bg-lightBeige rounded-2xl"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-burntOrange p-3 rounded-full">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-darkOlive font-semibold">+20 123 456 7890</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center space-y-3 p-6 bg-lightBeige rounded-2xl"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="bg-brightOrange p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-darkOlive font-semibold">القاهرة، مصر</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsPage; 