import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const { settings } = useSiteSettings();

  useEffect(() => {
    apiFetch('listcategories')
      .then(data => setCategories(data.data || data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="bg-roman-500 text-white md:block hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/Asset_12.svg" 
                alt="بازار Logo" 
                className="h-8 w-8 object-contain ml-2"
              />
              <h3 className="text-xl font-bold text-white">بازار</h3>
            </div>
            <p className="text-neutral-100 mb-4">
              {settings.siteDescription || 'منصة تجمع الحرفيين والمبدعين في مكان واحد، لعرض منتجاتهم اليدوية الفريدة والتواصل مع العملاء مباشرة.'}
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="https://www.facebook.com/share/17NFcvrTN2/" target="_blank" rel="noopener noreferrer" className="text-neutral-200 hover:text-roman-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/bazar__official" target="_blank" rel="noopener noreferrer" className="text-neutral-200 hover:text-roman-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.youtube.com/@OfficialBAZAR-s4p" target="_blank" rel="noopener noreferrer" className="text-neutral-200 hover:text-roman-500 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-neutral-200 hover:text-neutral-900 transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link to="/explore" className="text-neutral-200 hover:text-neutral-900 transition-colors">استكشاف</Link>
              </li>
              <li>
                <Link to="/about-us" className="text-neutral-200 hover:text-neutral-900 transition-colors">من نحن</Link>
              </li>
              <li>
                <Link to="/policy" className="text-neutral-200 hover:text-neutral-900 transition-colors">السياسات</Link>
              </li>
              <li>
                <Link to="/announcements" className="text-neutral-200 hover:text-neutral-900 transition-colors">الإعلانات</Link>
              </li>
            </ul>
          </div>

                <div>
                <h3 className="text-xl font-bold mb-4 text-white">التصنيفات</h3>
                <ul className="space-y-2">
                  {categories.slice(0, Math.ceil(categories.length / 2)).map(cat => (
                  <li key={cat.id}>
                    <Link to={`/explore?category=${cat.id}`} className="text-neutral-200 hover:text-neutral-900 transition-colors">{cat.name}</Link>
                  </li>
                  ))}
                </ul>
                </div>

                {/* More Categories */}
                <div>
                <h3 className="text-xl font-bold mb-4 text-white">المزيد من التصنيفات</h3>
                <ul className="space-y-2">
                  {categories.slice(Math.ceil(categories.length / 2)).map(cat => (
                  <li key={cat.id}>
                    <Link to={`/explore?category=${cat.id}`} className="text-neutral-200 hover:text-neutral-900 transition-colors">{cat.name}</Link>
                  </li>
                  ))}
                </ul>
                </div>

                {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">اتصل بنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 space-x-reverse">
                <MapPin size={18} className="text-roman-500" />
                <span className="text-neutral-200">{settings.contactAddress || 'شارع الحرفيين، الفيوم ، مصر'}</span>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <Phone size={18} className="text-roman-500" />
                <a href={`tel:${settings.contactPhone}`} className="text-neutral-200 hover:text-neutral-900 transition-colors">
                  {settings.contactPhone || '+201068644570'}
                </a>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <Mail size={18} className="text-roman-500" />
                <a href={`mailto:${settings.contactEmail}`} className="text-neutral-200 hover:text-neutral-900 transition-colors">
                  {settings.contactEmail || 'officialbazar64@gmail.com'}
                </a>
              </li>
              <li className="flex items-center space-x-3 space-x-reverse">
                <Clock size={18} className="text-roman-500" />
                <span className="text-neutral-200">{settings.workingHours || 'السبت - الخميس: 9:00 صباحاً - 6:00 مساءً'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-300 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-neutral-200">
            <p>© {new Date().getFullYear()} بازار. جميع الحقوق محفوظة.</p>
            <div className="flex space-x-6 space-x-reverse mt-4 md:mt-0">
              <Link to="/policy" className="hover:text-neutral-900 transition-colors">شروط الاستخدام</Link>
              <Link to="/about-us" className="hover:text-neutral-900 transition-colors">من نحن</Link>
              <Link to="/about-us" className="hover:text-neutral-900 transition-colors">تواصل معنا</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
