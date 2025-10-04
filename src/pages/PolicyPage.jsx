import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Star,
  AlertTriangle,
  CheckCircle,
  FileText,
  Eye,
  UserCheck,
  Gavel,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PolicyPage = () => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const policies = [
    {
      id: 'registration',
      title: 'سياسة التسجيل وإنشاء الحسابات',
      icon: Users,
      content: [
        {
          subtitle: 'متطلبات التسجيل',
          points: [
            'يجب أن يكون عمر المستخدم 18 عاماً أو أكثر',
            'يجب توفير بريد إلكتروني صحيح وفعال',
            'يتطلب التحقق من البريد الإلكتروني خلال 24 ساعة',
            'المعلومات المدخلة يجب أن تكون حقيقية ودقيقة',
            'لا يمكن استخدام أسماء مستعارة أو هويات وهمية'
          ]
        },
        {
          subtitle: 'أنواع الحسابات',
          points: [
            'حساب مشتري: للتصفح والشراء من المنصة',
            'حساب بائع: لعرض وبيع المنتجات اليدوية',
            'يمكن التبديل بين أنواع الحسابات من لوحة التحكم',
            'حساب البائع يتطلب اشتراك شهري بعد انتهاء الفترة المجانية'
          ]
        },
        {
          subtitle: 'التحقق من الهوية',
          points: [
            'إرسال كود مكون من 6 أرقام للبريد الإلكتروني',
            'صلاحية الكود 15 دقيقة فقط',
            'لا يمكن استخدام الكود أكثر من مرة واحدة',
            'يحق للمنصة طلب وثائق إضافية للتحقق من الهوية عند الحاجة'
          ]
        }
      ]
    },
    {
      id: 'security',
      title: 'سياسات الأمان والحماية',
      icon: Shield,
      content: [
        {
          subtitle: 'حماية كلمات المرور',
          points: [
            'يتم تشفير جميع كلمات المرور باستخدام تقنيات آمنة',
            'لا يتم تخزين كلمات المرور بشكل صريح أبداً',
            'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل',
            'يُنصح بتضمين أرقام وأحرف خاصة في كلمة المرور'
          ]
        },
        {
          subtitle: 'حماية من التسلل',
          points: [
            'قفل الحساب بعد 5 محاولات دخول فاشلة',
            'إشعار فوري عبر البريد الإلكتروني عند محاولات الدخول المشبوهة',
            'تسجيل جميع محاولات الدخول مع الوقت والتاريخ',
            'إمكانية إلغاء جميع الجلسات النشطة عند تغيير كلمة المرور'
          ]
        },
        {
          subtitle: 'استرجاع كلمة المرور',
          points: [
            'يتم الاسترجاع فقط عبر البريد الإلكتروني المُسجل',
            'رمز الاسترجاع صالح لمدة 15 دقيقة فقط',
            'لا يمكن استخدام نفس رمز الاسترجاع أكثر من مرة',
            'إلغاء جميع الجلسات النشطة بعد تغيير كلمة المرور بنجاح'
          ]
        }
      ]
    },
    {
      id: 'products',
      title: 'سياسة المنتجات والبيع',
      icon: Star,
      content: [
        {
          subtitle: 'متطلبات رفع المنتجات',
          points: [
            'يتطلب اشتراك نشط في إحدى الباقات المدفوعة',
            'جميع المنتجات يجب أن تكون يدوية الصنع',
            'مراجعة جميع المنتجات قبل النشر من قبل الإدارة',
            'يحق للإدارة رفض أي منتج لا يتوافق مع معايير المنصة',
            'الحد الأقصى 5 صور لكل منتج'
          ]
        },
        {
          subtitle: 'المحتوى المحظور',
          points: [
            'منتجات تحتوي على محتوى مسيء أو غير لائق',
            'منتجات مقلدة أو منسوخة من علامات تجارية أخرى',
            'منتجات خطيرة أو مواد محظورة قانونياً',
            'معلومات تواصل خارجية في وصف المنتج',
            'روابط لمواقع أو منصات أخرى'
          ]
        },
        {
          subtitle: 'نظام الباقات',
          points: [
            'الباقة المجانية: شهر واحد عند التسجيل',
            'إمكانية تمديد الباقة المجانية شهرين إضافيين بالدعوات',
            'الباقة الأساسية (100 جنيه): رفع منتجات + توصيل',
            'الباقة الاحترافية (250 جنيه): جميع المميزات + تصوير احترافي + إنشاء فعاليات',
            'تجميد المنتجات عند انتهاء الباقة'
          ]
        }
      ]
    },
    {
      id: 'orders',
      title: 'سياسة الطلبات والمدفوعات',
      icon: CreditCard,
      content: [
        {
          subtitle: 'إنشاء الطلبات',
          points: [
            'يتطلب تسجيل الدخول لإنشاء طلب',
            'يجب إدخال جميع بيانات الشحن مكتملة',
            'رفع إثبات الدفع للطرق اليدوية (فودافون كاش، إنستاباي)',
            'موافقة المشرف على الطلب قبل بدء التنفيذ'
          ]
        },
        {
          subtitle: 'حالات الطلب',
          points: [
            'قيد الانتظار: بعد إنشاء الطلب مباشرة',
            'مدفوع: بعد موافقة المشرف على إثبات الدفع',
            'جاري التنفيذ: بعد موافقة البائع وبدء العمل',
            'جاري التوصيل: عند استلام الدليفري للمنتج',
            'مكتمل: عند التسليم النهائي للعميل',
            'ملغي: عند الإلغاء من البائع أو المشرف'
          ]
        },
        {
          subtitle: 'نظام العربون',
          points: [
            'يمكن دفع عربون من خلال المحادثة مع البائع',
            'قيمة العربون لا تتجاوز 100% من سعر المنتج',
            'يتم تسجيل العربون وإثبات الدفع',
            'إمكانية دفع الرصيد المتبقي لاحقاً',
            'لا يمكن إلغاء الطلب بعد دفع العربون إلا بموافقة البائع'
          ]
        }
      ]
    },
    {
      id: 'messaging',
      title: 'سياسة المراسلة والتواصل',
      icon: MessageSquare,
      content: [
        {
          subtitle: 'قواعد المحادثة',
          points: [
            'المحادثات مخصصة لمناقشة تفاصيل المنتجات والطلبات فقط',
            'منع مشاركة معلومات التواصل الخارجي (أرقام هواتف، إيميلات)',
            'منع إرسال روابط لمواقع أو منصات أخرى',
            'فلترة تلقائية للمحتوى غير المناسب',
            'إمكانية الإبلاغ عن إساءة الاستخدام'
          ]
        },
        {
          subtitle: 'المحتوى المحظور',
          points: [
            'الكلمات المسيئة أو التنمر',
            'المحتوى الذي يحرض على العنف أو الكراهية',
            'التهديدات أو التخويف',
            'المحتوى الجنسي أو غير اللائق',
            'الرسائل التجارية المزعجة (سبام)'
          ]
        },
        {
          subtitle: 'العقوبات',
          points: [
            'تحذير أولي للمخالفات البسيطة',
            'حظر مؤقت للمخالفات المتكررة',
            'حظر دائم للمخالفات الجسيمة',
            'حذف الرسائل المخالفة تلقائياً',
            'تعليق الحساب عند الإصرار على المخالفة'
          ]
        }
      ]
    },
    {
      id: 'reviews',
      title: 'سياسة التقييمات والمراجعات',
      icon: Star,
      content: [
        {
          subtitle: 'شروط كتابة المراجعات',
          points: [
            'يتطلب إكمال الطلب بنجاح لكتابة مراجعة',
            'مراجعة واحدة فقط لكل طلب مكتمل',
            'يجب أن تكون المراجعة حول المنتج والخدمة فقط',
            'منع المراجعات الشخصية أو المسيئة للبائع',
            'مراجعة المحتوى قبل النشر'
          ]
        },
        {
          subtitle: 'معايير المراجعات',
          points: [
            'الصدق والموضوعية في التقييم',
            'التركيز على جودة المنتج ووقت التسليم',
            'منع المراجعات المدفوعة أو المزيفة',
            'إمكانية رد البائع على المراجعات',
            'حذف المراجعات غير العادلة أو المضللة'
          ]
        }
      ]
    },
    {
      id: 'delivery',
      title: 'سياسة التوصيل',
      icon: CheckCircle,
      content: [
        {
          subtitle: 'خدمة التوصيل',
          points: [
            'موظفو التوصيل مُعتمدون من المنصة',
            'تتبع GPS للطلبات في الوقت الفعلي',
            'محاولتان للتوصيل خلال 3 أيام',
            'إرفاق صور عند رفض استلام المنتج',
            'تقييم موظف التوصيل بعد كل عملية تسليم'
          ]
        },
        {
          subtitle: 'مسؤوليات العميل',
          points: [
            'توفير عنوان واضح ومفصل',
            'تواجد شخص لاستلام الطلب في الوقت المحدد',
            'فحص المنتج عند الاستلام',
            'الإبلاغ عن أي مشاكل فوراً',
            'احترام موظف التوصيل والتعامل بأدب'
          ]
        }
      ]
    },
    {
      id: 'privacy',
      title: 'سياسة الخصوصية وحماية البيانات',
      icon: Lock,
      content: [
        {
          subtitle: 'جمع البيانات',
          points: [
            'نجمع فقط البيانات الضرورية لتشغيل الخدمة',
            'بيانات الهوية والتواصل والعنوان',
            'سجل المعاملات والطلبات',
            'بيانات تحليلات الاستخدام (مجهولة الهوية)',
            'ملفات تعريف الارتباط لتحسين التجربة'
          ]
        },
        {
          subtitle: 'استخدام البيانات',
          points: [
            'تقديم وتحسين خدمات المنصة',
            'معالجة الطلبات والمدفوعات',
            'التواصل بخصوص الطلبات والحساب',
            'منع الاحتيال وضمان الأمان',
            'تحليلات لتطوير المنصة'
          ]
        },
        {
          subtitle: 'حماية البيانات',
          points: [
            'تشفير جميع البيانات الحساسة',
            'حماية متقدمة للخوادم والأنظمة',
            'عدم مشاركة البيانات مع أطراف ثالثة دون موافقة',
            'إمكانية حذف الحساب والبيانات',
            'نسخ احتياطية آمنة ومشفرة'
          ]
        }
      ]
    },
    {
      id: 'violations',
      title: 'المخالفات والعقوبات',
      icon: AlertTriangle,
      content: [
        {
          subtitle: 'أنواع المخالفات',
          points: [
            'انتحال الهوية أو استخدام معلومات كاذبة',
            'محاولة الاحتيال أو التلاعب في الأسعار',
            'رفع منتجات مخالفة أو محظورة',
            'إساءة استخدام نظام المراسلة',
            'التحايل على قواعد النظام'
          ]
        },
        {
          subtitle: 'نظام العقوبات',
          points: [
            'تنبيه أولي للمخالفات البسيطة',
            'تقييد مؤقت لبعض الميزات',
            'تعليق الحساب لفترة محددة',
            'حظر دائم للمخالفات الجسيمة',
            'إحالة للسلطات في القضايا القانونية'
          ]
        },
        {
          subtitle: 'حق الاستئناف',
          points: [
            'إمكانية الاستئناف خلال 15 يوم من العقوبة',
            'مراجعة شاملة للحالة من قبل فريق مختص',
            'رد خلال 7 أيام عمل من تاريخ الاستئناف',
            'إمكانية تقديم أدلة أو توضيحات إضافية',
            'القرار النهائي ملزم لجميع الأطراف'
          ]
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      {/* Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">سياسات وقوانين المنصة</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          يرجى قراءة هذه السياسات بعناية قبل استخدام منصة بازار. هذه القوانين تضمن تجربة آمنة وعادلة لجميع المستخدمين.
        </p>
      </motion.div>

      {/* Important Notice */}
      <motion.div 
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-start space-x-3 space-x-reverse">
          <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">إشعار هام</h3>
            <p className="text-yellow-700 text-right">
              استخدام منصة بازار يعني موافقتك على جميع الشروط والأحكام المذكورة أدناه. 
              نحتفظ بالحق في تحديث هذه السياسات في أي وقت، وسيتم إشعارك بأي تغييرات هامة.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Policy Sections */}
      <div className="space-y-6">
        {policies.map((policy, index) => (
          <motion.div
            key={policy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-neutral-200/50 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection(policy.id)}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                                      <div className="bg-roman-500/10 rounded-lg p-2">
                    <policy.icon className="h-6 w-6 text-roman-500" />
                    </div>
                    <span className="text-xl font-bold text-gray-800">{policy.title}</span>
                  </div>
                  {expandedSection === policy.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </CardTitle>
              </CardHeader>
              
              {expandedSection === policy.id && (
                <CardContent className="space-y-6">
                  {policy.content.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                        {section.subtitle}
                      </h4>
                      <ul className="space-y-3">
                        {section.points.map((point, pointIndex) => (
                          <li key={pointIndex} className="flex items-start space-x-3 space-x-reverse">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-right">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contact Section */}
      <motion.div 
        className="mt-12 bg-gradient-to-r from-roman-500/5 to-warning-500/5 rounded-2xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Gavel className="h-12 w-12 text-roman-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-4">لديك استفسار حول السياسات؟</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          إذا كان لديك أي استفسار حول هذه السياسات أو تحتاج إلى توضيح أي نقطة، 
          لا تتردد في التواصل مع فريق الدعم الفني.
        </p>
        <Button 
          className="bg-roman-500 hover:bg-roman-500/90 text-white px-8 py-3"
          onClick={() => window.location.href = '/about-us'}
        >
          <MessageSquare className="ml-2 h-5 w-5" />
          تواصل معنا
        </Button>
      </motion.div>

      {/* Last Updated */}
      <motion.div 
        className="text-center mt-8 text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        <p>آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
      </motion.div>
    </div>
  );
};

export default PolicyPage; 