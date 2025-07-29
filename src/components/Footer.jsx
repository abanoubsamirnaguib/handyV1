import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { apiFetch } from '@/lib/api';

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiFetch('listcategories')
      .then(data => setCategories(data.data || data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="bg-olivePrimary text-white md:block hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-lightBeige">بازار</h3>
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
                <Link to="/about-us" className="text-lightBeige/70 hover:text-burntOrange transition-colors">من نحن</Link>
              </li>
              <li>
                <Link to="/policy" className="text-lightBeige/70 hover:text-burntOrange transition-colors">السياسات</Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-lightBeige/70 hover:text-burntOrange transition-colors">اتصل بنا</Link>
              </li>
            </ul>
          </div>

                <div>
                <h3 className="text-xl font-bold mb-4 text-lightBeige">التصنيفات</h3>
                <ul className="space-y-2">
                  {categories.slice(0, Math.ceil(categories.length / 2)).map(cat => (
                  <li key={cat.id}>
                    <Link to={`/explore?category=${cat.id}`} className="text-lightBeige/70 hover:text-burntOrange transition-colors">{cat.name}</Link>
                  </li>
                  ))}
                </ul>
                </div>

                {/* More Categories */}
                <div>
                <h3 className="text-xl font-bold mb-4 text-lightBeige">المزيد من التصنيفات</h3>
                <ul className="space-y-2">
                  {categories.slice(Math.ceil(categories.length / 2)).map(cat => (
                  <li key={cat.id}>
                    <Link to={`/explore?category=${cat.id}`} className="text-lightBeige/70 hover:text-burntOrange transition-colors">{cat.name}</Link>
                  </li>
                  ))}
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

        <div className="border-t border-lightBeige/20 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-lightBeige/60">
            <p>© {new Date().getFullYear()} بازار. جميع الحقوق محفوظة.</p>
            <div className="flex space-x-6 space-x-reverse mt-4 md:mt-0">
              <Link to="/policy" className="hover:text-burntOrange transition-colors">شروط الاستخدام</Link>
              <Link to="/about-us" className="hover:text-burntOrange transition-colors">من نحن</Link>
              <Link to="/contact-us" className="hover:text-burntOrange transition-colors">تواصل معنا</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
