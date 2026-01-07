<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; background-color: #f8f9fa;'>
    <div style='background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
        <h1 style='color: #007bff; text-align: center; margin-bottom: 20px;'>مرحباً بك في بازار! 🎉</h1>
        
        <p style='color: #333; font-size: 16px; line-height: 1.6;'>عزيزي/عزيزتي <strong>{{ $body['name'] }}</strong>،</p>
        
        <p style='color: #666; font-size: 15px; line-height: 1.6;'>
            نحن سعداء جداً بانضمامك إلى منصة بازار! شكراً لاختيارك منصتنا لتكون جزءاً من مجتمعنا المتنامي.
        </p>
        
        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;'>
            <h2 style='color: #ffffff; margin: 0 0 15px 0; font-size: 20px;'>ماذا بعد؟</h2>
            <p style='color: #ffffff; margin: 0; font-size: 14px; line-height: 1.8;'>
                @if($body['is_seller'])
                    يمكنك الآن البدء في عرض منتجاتك وحرفك وبناء متجرك الخاص!<br>
                    استكشف لوحة التحكم الخاصة بك وابدأ رحلتك في البيع.
                @else
                    استكشف آلاف المنتجات والحرف المميزة من البائعين الموثوقين.<br>
                    ابدأ التسوق واستمتع بتجربة فريدة!
                @endif
            </p>
        </div>
        
        <div style='background-color: #f8f9fa; border-right: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px;'>
            <h3 style='color: #28a745; margin-top: 0; font-size: 18px;'>✨ نصائح للبداية:</h3>
            <ul style='color: #666; font-size: 14px; line-height: 1.8; margin: 10px 0;'>
                @if($body['is_seller'])
                    <li>أكمل ملفك الشخصي لجذب المزيد من العملاء</li>
                    <li>أضف منتجاتك الأولى بوصف مفصل وصور واضحة</li>
                    <li>استفد من الباقة المجانية لمدة 30 يوماً</li>
                    <li>تفاعل مع عملائك عبر نظام المراسلة</li>
                @else
                    <li>تصفح الفئات المختلفة لإيجاد ما تحتاجه</li>
                    <li>أضف المنتجات المفضلة لديك لسهولة الوصول إليها</li>
                    <li>تواصل مع البائعين للحصول على تفاصيل إضافية</li>
                    <li>قيّم مشترياتك لمساعدة الآخرين</li>
                @endif
            </ul>
        </div>
        
        <div style='text-align: center; margin: 30px 0;'>
            <a href='{{ $body['dashboard_url'] }}' style='display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 35px; border-radius: 5px; font-size: 16px; font-weight: bold;'>
                انتقل إلى لوحة التحكم
            </a>
        </div>

        @if(!empty($body['referral_link']))
            <div style='background-color: #fff3cd; border-right: 4px solid #ffc107; padding: 18px; margin: 20px 0; border-radius: 5px;'>
                <h3 style='color: #856404; margin-top: 0; font-size: 16px;'>🔗 رابط الدعوة الخاص بك</h3>
                <p style='color: #856404; font-size: 14px; line-height: 1.7; margin: 0 0 10px 0;'>
                    شارك رابط الدعوة مع أصدقائك. عند التسجيل عبر الرابط قد تحصل على رصيد هدية (حسب إعدادات المنصة).
                </p>
                @if(!empty($body['referral_code']))
                    <p style='color: #856404; font-size: 14px; margin: 0 0 8px 0;'>
                        <strong>كود الدعوة:</strong> {{ $body['referral_code'] }}
                    </p>
                @endif
                <p style='color: #856404; font-size: 13px; margin: 0; word-break: break-all; direction: ltr; text-align: left;'>
                    {{ $body['referral_link'] }}
                </p>
            </div>
        @endif
        
        <p style='color: #666; font-size: 14px; line-height: 1.6; border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;'>
            إذا كان لديك أي استفسار أو تحتاج إلى مساعدة، فريق الدعم لدينا جاهز دائماً لمساعدتك.
        </p>
        
        <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;'>
            <p style='color: #999; font-size: 12px; margin: 5px 0;'>
                مع أطيب التحيات،<br>
                <strong style='color: #007bff;'>فريق بازار</strong>
            </p>
        </div>
    </div>
</div>
