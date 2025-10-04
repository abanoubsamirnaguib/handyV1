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
  Clock, 
  Send, 
  MessageSquare,
  CheckCircle,
  Loader2,
  User,
  AtSign,
  MessageCircle,
  PhoneCall,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const AboutUsPage = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState([
    { number: "0", label: "حرفي موثوق", icon: Users },
    { number: "0", label: "منتج يدوي", icon: Palette },
    { number: "0", label: "عميل راضي", icon: Star },
    { number: "0", label: "تصنيف متنوع", icon: Globe }
  ]);
  const [loading, setLoading] = useState(true);
  
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  // Contact form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        variant: "destructive",
        title: "خطأ في الإرسال",
        description: "الرجاء ملء جميع الحقول المطلوبة"
      });
      return;
    }

    setFormLoading(true);
    try {
      const response = await api.submitContactForm(formData);
      
      if (response) {
        setSubmitted(true);
        toast({
          title: "تم إرسال رسالتك بنجاح",
          description: "سنتواصل معك قريباً، شكراً لتواصلك معنا"
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        variant: "destructive",
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال رسالتك، الرجاء المحاولة مرة أخرى"
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Success message component
  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4" dir="rtl">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
        >
          <div className="bg-white rounded-3xl p-12 shadow-2xl border border-success-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-roman-500"></div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            >
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">تم إرسال رسالتك بنجاح!</h2>
            <p className="text-neutral-900 mb-8 text-lg leading-relaxed">
              شكراً لتواصلك معنا. سنتواصل معك عبر البريد الإلكتروني أو الهاتف خلال 24-48 ساعة.
            </p>
            <Button 
              onClick={() => setSubmitted(false)}
              className="bg-roman-500 hover:bg-roman-500/90 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              إرسال رسالة أخرى
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const values = [
    {
      title: "الجودة والإتقان",
      description: "نؤمن بأن كل قطعة يدوية تحمل روح صانعها ولمسة الإبداع الحقيقي",
      icon: Award,
      color: "roman-500"
    },
    {
      title: "دعم الحرفيين",
      description: "نوفر منصة عادلة تمكن الحرفيين من عرض إبداعاتهم والوصول لجمهور أوسع",
      icon: UserCheck,
      color: "roman-500"
    },
    {
      title: "الأصالة والتراث",
      description: "نحافظ على التراث المصري العريق ونقدمه بثوب عصري يناسب الأجيال الجديدة",
      icon: Heart,
      color: "warning-500"
    }
  ];

  const features = [
    {
      title: "منتجات يدوية أصلية 100%",
      icon: Palette,
      color: "roman-500"
    },
    {
      title: "جودة مضمونة وحرفية عالية",
      icon: Award,
      color: "roman-500"
    },
    {
      title: "صنع بحب وشغف حقيقي",
      icon: Heart,
      color: "warning-500"
    },
    {
      title: "دعم فني متواصل",
      icon: Shield,
      color: "success-500"
    }
  ];

  const team = [
    {
      name: "أحمد محمد",
      role: "مؤسس ومدير عام",
      description: "خبير في التجارة الإلكترونية مع شغف بدعم الحرفيين المصريين",
      color: "roman-500"
    },
    {
      name: "فاطمة أحمد",
      role: "مديرة المنتجات",
      description: "متخصصة في تطوير المنتجات مع خلفية في الفنون والحرف اليدوية",
      color: "roman-500"
    },
    {
      name: "محمود علي",
      role: "مدير التكنولوجيا",
      description: "مطور برامج محترف يهتم بإنشاء حلول تقنية مبتكرة",
      color: "warning-500"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-100" dir="rtl">
      {/* Hero Section */}
      <div className="bg-roman-500 text-white py-20 relative overflow-hidden">
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
              منصة <span className="inline-flex items-center gap-2 font-bold text-neutral-100">
                <img 
                  src="/Asset_9.svg" 
                  alt="بازار Logo" 
                  className="h-8 w-8 object-contain inline"
                />
                بازار
              </span> هي المكان الذي يجمع بين الحرفيين المبدعين والعملاء الباحثين عن الأصالة والجودة. 
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
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-success-200 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-success-200 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10 text-center">
                <div className="bg-roman-500 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Eye className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-neutral-900 mb-6">رؤيتنا</h3>
                <p className="text-neutral-700 leading-relaxed text-lg">
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
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-success-200 relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-32 h-32 bg-neutral-100 rounded-full -translate-y-16 -translate-x-16"></div>
              <div className="relative z-10 text-center">
                <div className="bg-roman-500 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Target className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-neutral-900 mb-6">مهمتنا</h3>
                <p className="text-neutral-700 leading-relaxed text-lg">
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
            <h3 className="text-4xl font-bold text-neutral-900 mb-4">إنجازاتنا بالأرقام</h3>
            <p className="text-xl text-neutral-700">أرقام تعكس ثقة عملائنا وشركائنا</p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-success-200">
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
                  <div className="bg-neutral-100 rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <div className={`bg-${index % 2 === 0 ? 'roman-500' : 'roman-500'} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`text-3xl font-bold text-${index % 2 === 0 ? 'roman-500' : 'roman-500'} mb-2`}>
                      {loading ? (
                        <div className="animate-pulse bg-success-200 h-8 w-16 mx-auto rounded"></div>
                      ) : (
                        stat.number
                      )}
                    </div>
                    <div className="text-neutral-700 font-medium">{stat.label}</div>
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
            <h3 className="text-4xl font-bold text-neutral-900 mb-4">قيمنا ومبادئنا</h3>
            <p className="text-xl text-neutral-700">المبادئ التي توجه عملنا وتحدد هويتنا</p>
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
                <Card className="h-full border-2 border-success-200 hover:border-roman-500/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className={`bg-${value.color} p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <value.icon className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-neutral-900 mb-4">{value.title}</h4>
                    <p className="text-neutral-700 leading-relaxed">{value.description}</p>
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
            <h3 className="text-4xl font-bold text-neutral-900 mb-4">شغفنا بالفن والإبداع</h3>
            <p className="text-xl text-neutral-700">ما يميزنا ويجعلنا خيارك الأول</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-success-200">
              <p className="text-lg text-neutral-700 leading-relaxed mb-8">
                في بازار، نؤمن بأن كل قطعة يدوية تحكي قصة. قصة الحرفي الذي أبدعها، قصة التراث الذي تحمله، 
                وقصة الحب والشغف الذي وُضع فيها. نحن لسنا مجرد منصة تجارية، بل مجتمع يقدر الفن الحقيقي.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3 space-x-reverse p-4 bg-neutral-100 rounded-xl"
                    whileHover={{ x: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`bg-${feature.color} p-2 rounded-lg`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-neutral-900 font-medium">{feature.title}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <motion.div 
                  className="bg-roman-500/20 rounded-2xl h-40 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Palette className="h-16 w-16 text-roman-500" />
                </motion.div>
                <motion.div 
                  className="bg-roman-500/20 rounded-2xl h-32 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Heart className="h-12 w-12 text-roman-500" />
                </motion.div>
              </div>
              <div className="space-y-6 mt-8">
                <motion.div 
                  className="bg-success-400/30 rounded-2xl h-32 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Award className="h-12 w-12 text-roman-500" />
                </motion.div>
                <motion.div 
                  className="bg-neutral-100 rounded-2xl h-40 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Users className="h-16 w-16 text-neutral-900" />
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
            <h3 className="text-4xl font-bold text-neutral-900 mb-4">فريق العمل</h3>
            <p className="text-xl text-neutral-700">الأشخاص الذين يجعلون أحلامنا حقيقة</p>
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
                <Card className="h-full border-2 border-success-200 hover:border-roman-500/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className={`bg-${member.color} p-4 rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <Users className="h-12 w-12 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-neutral-900 mb-2">{member.name}</h4>
                    <p className={`text-${member.color} font-medium mb-4`}>{member.role}</p>
                    <p className="text-neutral-700 text-sm leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Contact Section with Form */}
        <motion.div 
          className="grid grid-cols-1 xl:grid-cols-5 gap-12 mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          
          {/* Contact Information Section */}
          <motion.div 
            className="xl:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-success-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-success-100 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-right">معلومات التواصل</h2>
                
                <div className="space-y-8">
                  {/* Email */}
                  <motion.div 
                    className="flex items-center space-x-4 space-x-reverse group"
                    whileHover={{ x: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-roman-500 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right flex-1">
                      <h3 className="font-bold text-neutral-900 mb-1 text-lg">البريد الإلكتروني</h3>
                      <p className="text-roman-500 font-semibold text-left" dir="ltr">support@bazaar.com</p>
                      <p className="text-sm text-neutral-500">نجيب على رسائلك خلال 24 ساعة</p>
                    </div>
                  </motion.div>

                  {/* Phone */}
                  <motion.div 
                    className="flex items-center space-x-4 space-x-reverse group"
                    whileHover={{ x: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-warning-500 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right flex-1">
                      <h3 className="font-bold text-neutral-900 mb-1 text-lg">رقم الهاتف</h3>
                      <p className="text-warning-500 font-semibold text-left" dir="ltr">+20 123 456 7890</p>
                      <p className="text-sm text-neutral-500">من السبت إلى الخميس: 9 ص - 6 م</p>
                    </div>
                  </motion.div>

                  {/* Address */}
                  <motion.div 
                    className="flex items-center space-x-4 space-x-reverse group"
                    whileHover={{ x: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-roman-500 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right flex-1">
                      <h3 className="font-bold text-neutral-900 mb-1 text-lg">العنوان</h3>
                      <p className="text-darkOlive font-semibold">القاهرة، مصر</p>
                      <p className="text-sm text-roman-500">مقر منصة بازار للحرف اليدوية</p>
                    </div>
                  </motion.div>

                  {/* Working Hours */}
                  <motion.div 
                    className="flex items-center space-x-4 space-x-reverse group"
                    whileHover={{ x: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-success-500 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right flex-1">
                      <h3 className="font-bold text-neutral-900 mb-1 text-lg">ساعات العمل</h3>
                      <p className="text-roman-500 font-semibold">السبت - الخميس</p>
                      <p className="text-sm text-roman-500">9:00 صباحاً - 6:00 مساءً</p>
                    </div>
                  </motion.div>
                </div>

                {/* Quick Stats */}
                <div className="mt-12 pt-8 border-t border-success-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-roman-500">24</div>
                      <div className="text-sm text-roman-500">ساعة</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-roman-500">99%</div>
                      <div className="text-sm text-roman-500">استجابة</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-warning-500">7</div>
                      <div className="text-sm text-roman-500">أيام</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Message Form Section */}
          <motion.div 
            className="xl:col-span-3"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-neutral-100 rounded-3xl transform rotate-1"></div>
              
              {/* Main Form Container */}
              <div className="relative bg-white rounded-3xl shadow-2xl border border-success-200 overflow-hidden">
                {/* Header */}
                <div className="bg-roman-500 p-8 relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-darkOlive/20"></div>
                  <div className="relative z-10 text-center">
                    <MessageSquare className="h-12 w-12 text-white mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">أرسل لنا رسالة</h2>
                    <p className="text-white/90 text-lg">نحن نتطلع لسماع أفكارك واقتراحاتك</p>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Name and Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <label htmlFor="name" className="block text-sm font-bold text-neutral-900 mb-3 text-right flex items-center">
                          <User className="h-4 w-4 ml-2" />
                          الاسم الكامل *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="أدخل اسمك الكامل"
                          required
                          className="border-2 border-success-200 focus:border-roman-500 rounded-xl px-4 py-3 text-right transition-all duration-300 hover:border-success-400"
                          dir="rtl"
                        />
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <label htmlFor="email" className="block text-sm font-bold text-neutral-900 mb-3 text-right flex items-center">
                          <AtSign className="h-4 w-4 ml-2" />
                          البريد الإلكتروني *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          required
                          className="border-2 border-success-200 focus:border-roman-500 rounded-xl px-4 py-3 text-left transition-all duration-300 hover:border-success-400"
                          dir="ltr"
                        />
                      </motion.div>
                    </div>

                    {/* Phone and Subject Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <label htmlFor="phone" className="block text-sm font-bold text-neutral-900 mb-3 text-right flex items-center">
                          <PhoneCall className="h-4 w-4 ml-2" />
                          رقم الهاتف
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="01234567890"
                          className="border-2 border-success-200 focus:border-roman-500 rounded-xl px-4 py-3 text-left transition-all duration-300 hover:border-success-400"
                          dir="ltr"
                        />
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <label htmlFor="subject" className="block text-sm font-bold text-neutral-900 mb-3 text-right flex items-center">
                          <Globe className="h-4 w-4 ml-2" />
                          موضوع الرسالة
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="موضوع استفسارك"
                          className="border-2 border-success-200 focus:border-roman-500 rounded-xl px-4 py-3 text-right transition-all duration-300 hover:border-success-400"
                          dir="rtl"
                        />
                      </motion.div>
                    </div>

                    {/* Message */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="relative"
                    >
                      <label htmlFor="message" className="block text-sm font-bold text-neutral-900 mb-3 text-right flex items-center">
                        <MessageCircle className="h-4 w-4 ml-2" />
                        الرسالة *
                      </label>
                      <div className="relative">
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="اكتب رسالتك هنا... شاركنا أفكارك واقتراحاتك"
                          rows={6}
                          required
                          className="border-2 border-success-200 focus:border-roman-500 rounded-xl px-4 py-4 resize-none text-right transition-all duration-300 hover:border-success-400 bg-neutral-100/30 focus:bg-white"
                          dir="rtl"
                        />
                        <div className="absolute bottom-4 left-4 text-xs text-roman-500">
                          {formData.message.length} / 1000
                        </div>
                      </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div 
                      className="text-center pt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={formLoading}
                        className="bg-roman-500 hover:bg-roman-600 text-white px-12 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
                      >
                        {formLoading ? (
                          <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            جاري الإرسال...
                          </>
                        ) : (
                          <>
                            <Send className="mr-3 h-5 w-5" />
                            إرسال الرسالة
                          </>
                        )}
                      </Button>
                    </motion.div>

                    <motion.p 
                      className="text-sm text-roman-500 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      * الحقول المطلوبة
                    </motion.p>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">الأسئلة الشائعة</h2>
            <p className="text-xl text-neutral-900">إجابات على أكثر الأسئلة شيوعاً</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-success-200 hover:border-roman-500/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-8 text-right">
                  <div className="flex items-start space-x-4 space-x-reverse mb-4">
                    <div className="bg-roman-500/10 p-2 rounded-lg">
                      <Star className="h-5 w-5 text-roman-500" />
                    </div>
                    <h3 className="font-bold text-neutral-900 text-lg">كيف يمكنني التسجيل كحرفي؟</h3>
                  </div>
                  <p className="text-neutral-900 leading-relaxed">
                    يمكنك التسجيل من خلال إنشاء حساب جديد ثم التبديل إلى وضع البائع من لوحة التحكم الخاصة بك.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-success-200 hover:border-success-400/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-8 text-right">
                  <div className="flex items-start space-x-4 space-x-reverse mb-4">
                    <div className="bg-success-400/20 p-2 rounded-lg">
                      <Star className="h-5 w-5 text-success-500" />
                    </div>
                    <h3 className="font-bold text-neutral-900 text-lg">كيف يتم ضمان جودة المنتجات؟</h3>
                  </div>
                  <p className="text-neutral-900 leading-relaxed">
                    نراجع جميع المنتجات قبل نشرها ونتابع تقييمات العملاء لضمان أعلى مستويات الجودة.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-success-200 hover:border-roman-500/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-8 text-right">
                  <div className="flex items-start space-x-4 space-x-reverse mb-4">
                    <div className="bg-roman-500/10 p-2 rounded-lg">
                      <Star className="h-5 w-5 text-roman-500" />
                    </div>
                    <h3 className="font-bold text-neutral-900 text-lg">ما هي طرق الدفع المتاحة؟</h3>
                  </div>
                  <p className="text-neutral-900 leading-relaxed">
                    نقبل الدفع عند الاستلام، التحويل البنكي، والمحافظ الإلكترونية المختلفة.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-success-200 hover:border-warning-500/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-8 text-right">
                  <div className="flex items-start space-x-4 space-x-reverse mb-4">
                    <div className="bg-warning-500/10 p-2 rounded-lg">
                      <Star className="h-5 w-5 text-warning-500" />
                    </div>
                    <h3 className="font-bold text-neutral-900 text-lg">كم يستغرق وقت التوصيل؟</h3>
                  </div>
                  <p className="text-neutral-900 leading-relaxed">
                    يختلف وقت التوصيل حسب نوع المنتج والموقع، عادة من 3-7 أيام عمل.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsPage; 