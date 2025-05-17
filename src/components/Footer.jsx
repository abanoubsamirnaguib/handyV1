
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-darkOlive to-olivePrimary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-lightBeige">حرفتي</h3>
            <p className="text-lightBeige/80 mb-4">
              منصة تجمع الحرفيين والمبدعين في مكان واحد، لعرض منتجاتهم اليدوية الفريدة والتواصل مع العملاء مباشرة.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-lightBeige/70 hover:text-burntOrange transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-lightBeige/70 hover:text-burntOrange transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-lightBeige/70 hover:text-burntOrange transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-lightBeige/70 hover:text-burntOrange transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-lightBeige">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-lightBeige/70 hover:text-burntOrange transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link to="/explore" className="text-lightBeige/70 hover:text-burntOrange transition-colors">استكشاف</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-lightBeige/70 hover:text-burntOrange transition-colors">لوحة التحكم</Link>
              </li>
              <li>
                <Link to="/login" className="text-lightBeige/70 hover:text-burntOrange transition-colors">تسجيل الدخول</Link>
              </li>
              <li>
                <Link to="/register" className="text-lightBeige/70 hover:text-burntOrange transition-colors">إنشاء حساب</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-lightBeige">التصنيفات</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore?category=jewelry" className="text-lightBeige/70 hover:text-burntOrange transition-colors">المجوهرات</Link>
              </li>
              <li>
                <Link to="/explore?category=pottery" className="text-lightBeige/70 hover:text-burntOrange transition-colors">الفخار</Link>
              </li>
              <li>
                <Link to="/explore?category=textiles" className="text-lightBeige/70 hover:text-burntOrange transition-colors">المنسوجات</Link>
              </li>
              <li>
                <Link to="/explore?category=woodwork" className="text-lightBeige/70 hover:text-burntOrange transition-colors">أعمال الخشب</Link>
              </li>
              <li>
                <Link to="/explore?category=perfumes" className="text-lightBeige/70 hover:text-burntOrange transition-colors">عطور</Link>
              </li>
              <li>
                <Link to="/explore?category=clothes" className="text-lightBeige/70 hover:text-burntOrange transition-colors">ملابس</Link>
              </li>
              <li>
                <Link to="/explore?category=tableaux" className="text-lightBeige/70 hover:text-burntOrange transition-colors">طابلوهات</Link>
              </li>
              <li>
                <Link to="/explore?category=food" className="text-lightBeige/70 hover:text-burntOrange transition-colors">الاكل</Link>
              </li>
            </ul>
          </div>

          {/* More Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-lightBeige">المزيد من التصنيفات</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore?category=tatreez" className="text-lightBeige/70 hover:text-burntOrange transition-colors">تطويز</Link>
              </li>
              <li>
                <Link to="/explore?category=crochet" className="text-lightBeige/70 hover:text-burntOrange transition-colors">كورشية</Link>
              </li>
              <li>
                <Link to="/explore?category=concrete" className="text-lightBeige/70 hover:text-burntOrange transition-colors">كونكريت</Link>
              </li>
              <li>
                <Link to="/explore?category=accessories" className="text-lightBeige/70 hover:text-burntOrange transition-colors">اكسسوارات</Link>
              </li>
              <li>
                <Link to="/explore?category=resin" className="text-lightBeige/70 hover:text-burntOrange transition-colors">ريزن</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-lightBeige">اتصل بنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 space-x-reverse">
                <MapPin size={18} className="text-burntOrange" />
                <span className="text-lightBeige/70">شارع الحرفيين، القاهرة، مصر</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <Phone size={18} className="text-burntOrange" />
                <span className="text-lightBeige/70">+20 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <Mail size={18} className="text-burntOrange" />
                <span className="text-lightBeige/70">info@herafty.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-lightBeige/20 mt-10 pt-6 text-center text-lightBeige/60">
          <p>© {new Date().getFullYear()} حرفتي. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
