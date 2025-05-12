
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">حرفتي</h3>
            <p className="text-gray-300 mb-4">
              منصة تجمع الحرفيين والمبدعين في مكان واحد، لعرض منتجاتهم اليدوية الفريدة والتواصل مع العملاء مباشرة.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-300 hover:text-primary transition-colors">استكشاف</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-primary transition-colors">لوحة التحكم</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-primary transition-colors">تسجيل الدخول</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-primary transition-colors">إنشاء حساب</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">التصنيفات</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore?category=jewelry" className="text-gray-300 hover:text-primary transition-colors">المجوهرات</Link>
              </li>
              <li>
                <Link to="/explore?category=pottery" className="text-gray-300 hover:text-primary transition-colors">الفخار</Link>
              </li>
              <li>
                <Link to="/explore?category=textiles" className="text-gray-300 hover:text-primary transition-colors">المنسوجات</Link>
              </li>
              <li>
                <Link to="/explore?category=woodwork" className="text-gray-300 hover:text-primary transition-colors">أعمال الخشب</Link>
              </li>
              <li>
                <Link to="/explore?category=perfumes" className="text-gray-300 hover:text-primary transition-colors">عطور</Link>
              </li>
              <li>
                <Link to="/explore?category=clothes" className="text-gray-300 hover:text-primary transition-colors">ملابس</Link>
              </li>
              <li>
                <Link to="/explore?category=tableaux" className="text-gray-300 hover:text-primary transition-colors">طابلوهات</Link>
              </li>
              <li>
                <Link to="/explore?category=food" className="text-gray-300 hover:text-primary transition-colors">الاكل</Link>
              </li>
            </ul>
          </div>

          {/* More Categories */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">المزيد من التصنيفات</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore?category=tatreez" className="text-gray-300 hover:text-primary transition-colors">تطويز</Link>
              </li>
              <li>
                <Link to="/explore?category=crochet" className="text-gray-300 hover:text-primary transition-colors">كورشية</Link>
              </li>
              <li>
                <Link to="/explore?category=concrete" className="text-gray-300 hover:text-primary transition-colors">كونكريت</Link>
              </li>
              <li>
                <Link to="/explore?category=accessories" className="text-gray-300 hover:text-primary transition-colors">اكسسوارات</Link>
              </li>
              <li>
                <Link to="/explore?category=resin" className="text-gray-300 hover:text-primary transition-colors">ريزن</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">اتصل بنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 space-x-reverse">
                <MapPin size={18} className="text-primary" />
                <span className="text-gray-300">شارع الحرفيين، القاهرة، مصر</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <Phone size={18} className="text-primary" />
                <span className="text-gray-300">+20 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <Mail size={18} className="text-primary" />
                <span className="text-gray-300">info@herafty.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} حرفتي. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
