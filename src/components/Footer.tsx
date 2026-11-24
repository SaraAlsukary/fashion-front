import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Heart,
  Home as HomeIcon,
  ShoppingBag,
  User,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ArrowUpLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';

interface StorefrontFooterProps {
  favoriteCount?: number;
  bagCount?: number;
}

const StorefrontFooter: React.FC<StorefrontFooterProps> = ({
  favoriteCount = 0,
  bagCount = 0,
}) => {
  const { pathname } = useLocation();

  const isHomeActive = pathname === '/home' || pathname === '/';
  const isFavActive = pathname.startsWith('/favorites');
  const isBagActive = pathname.startsWith('/cart');
  const isProfileActive = pathname.startsWith('/profile');

  return (
    <>
      {/* فوتر سطح المكتب الفخم بخلفية سوداء متدرجة */}
      <footer className="hidden md:block relative overflow-hidden bg-gradient-to-b from-neutral-950 via-zinc-900 to-brand-shadow text-surface/90 mt-16 border-t border-brand/30">
        {/* إضاءة عنابية خافتة في الخلفية */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-brand/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-10 w-80 h-80 rounded-full bg-brand-plum/15 blur-3xl"
        />

        {/* شريط المزايا العلوي */}
        <div className="relative border-b border-surface/10">
          <div className="max-w-6xl mx-auto px-8 py-6 grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-brand/25 border border-brand-rose/30 text-brand-rose flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-surface" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-surface">شحن سريع وآمن</h4>
                <p className="text-xs text-surface/60 mt-0.5">
                  توصيل موثوق إلى جميع المحافظات
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-brand/25 border border-brand-rose/30 text-brand-rose flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-surface" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-surface">ماركات أصلية 100%</h4>
                <p className="text-xs text-surface/60 mt-0.5">
                  تشكيلة منتقاة من أرقى المتاجر ودور الأزياء
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-brand/25 border border-brand-rose/30 text-brand-rose flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-surface" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-surface">استبدال مرن</h4>
                <p className="text-xs text-surface/60 mt-0.5">
                  إمكانية الاستبدال بسهولة وفق سياسة المتجر
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي للفوتر */}
        <div className="relative max-w-6xl mx-auto px-8 py-12 grid grid-cols-12 gap-10">
          {/* العمود الأول: الهوية والوصف */}
          <div className="col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-rose flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-surface" />
              </span>
              <span className="text-xl font-extrabold tracking-wide text-surface">
                AURELIA <span className="text-brand-rose font-light">MARKET</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-surface/70 leading-relaxed max-w-sm">
              وجهتك الأولى لعالم الأزياء الراقية، الحقائب، الأحذية، والإكسسوارات
              العصرية. نجمع لكِ نخبة المتاجر والماركات في تجربة تسوق استثنائية.
            </p>

            <div className="pt-2">
              <Link
                to="/create-shop"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand hover:bg-brand-wine border border-brand-rose/40 text-surface text-xs font-semibold transition-all shadow-sm"
              >
                <span>افتح متجرك معنا</span>
                <ArrowUpLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* العمود الثاني: روابط التسوق */}
          <div className="col-span-2 space-y-3.5">
            <h3 className="text-sm font-bold text-surface tracking-wide border-r-2 border-brand-rose pr-2.5">
              التسوق
            </h3>
            <ul className="space-y-2.5 text-xs text-surface/70">
              <li>
                <Link to="/home" className="hover:text-surface transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/shops" className="hover:text-surface transition-colors">
                  المتاجر المميزة
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-surface transition-colors">
                  جميع المنتجات
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-surface transition-colors">
                  العروض والتخفيضات
                </Link>
              </li>
            </ul>
          </div>

          {/* العمود الثالث: حسابي */}
          <div className="col-span-2 space-y-3.5">
            <h3 className="text-sm font-bold text-surface tracking-wide border-r-2 border-brand-rose pr-2.5">
              حسابي
            </h3>
            <ul className="space-y-2.5 text-xs text-surface/70">
              <li>
                <Link to="/profile" className="hover:text-surface transition-colors">
                  الملف الشخصي
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-surface transition-colors">
                  قائمة المفضلة
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-surface transition-colors">
                  حقيبة التسوق
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-surface transition-colors">
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>

          {/* العمود الرابع: تواصل معنا */}
          <div className="col-span-3 space-y-3.5">
            <h3 className="text-sm font-bold text-surface tracking-wide border-r-2 border-brand-rose pr-2.5">
              تواصل معنا
            </h3>
            <ul className="space-y-3 text-xs text-surface/70">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-rose shrink-0" />
                <span>سوريا — حلب، الفرقان</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-rose shrink-0" />
                <span dir="ltr">+963 900 000 000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-rose shrink-0" />
                <span dir="ltr">support@aurelia-market.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* الشريط السفلي للحقوق */}
        <div className="relative border-t border-surface/10 bg-black/40">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between text-[11px] text-surface/55">
            <p>© 2026 جميع الحقوق محفوظة لـ AURELIA MARKET</p>
            <div className="flex items-center gap-5">
              <Link to="/privacy" className="hover:text-surface/85 transition-colors">
                سياسة الخصوصية
              </Link>
              <Link to="/terms" className="hover:text-surface/85 transition-colors">
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* شريط التنقل السفلي للجوال */}
      <nav
        aria-label="التنقل السفلي"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-gradient-to-r from-neutral-950 via-zinc-900 to-brand-shadow border-t border-brand-rose/30 rounded-t-2xl px-4 py-2.5 flex items-center justify-around shadow-2xl"
      >
        <Link
          to="/favorites"
          className={`relative flex flex-col items-center gap-0.5 text-[11px] transition-colors ${
            isFavActive ? 'text-brand-rose font-bold' : 'text-surface/70 hover:text-surface'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavActive ? 'fill-brand-rose text-brand-rose' : ''}`} />
          <span>favourit</span>
          {favoriteCount > 0 && (
            <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-brand text-surface text-[10px] font-bold flex items-center justify-center">
              {favoriteCount}
            </span>
          )}
        </Link>

        <Link
          to="/home"
          className={`flex flex-col items-center gap-0.5 text-[11px] transition-colors ${
            isHomeActive ? 'text-brand-rose font-bold' : 'text-surface/70 hover:text-surface'
          }`}
        >
          <HomeIcon className={`w-5 h-5 ${isHomeActive ? 'fill-brand-rose text-brand-rose' : ''}`} />
          <span>Home</span>
        </Link>

        <Link
          to="/cart"
          className={`relative flex flex-col items-center gap-0.5 text-[11px] transition-colors ${
            isBagActive ? 'text-brand-rose font-bold' : 'text-surface/70 hover:text-surface'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${isBagActive ? 'fill-brand-rose/20 text-brand-rose' : ''}`} />
          <span>Bag</span>
          {bagCount > 0 && (
            <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-brand text-surface text-[10px] font-bold flex items-center justify-center">
              {bagCount}
            </span>
          )}
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center gap-0.5 text-[11px] transition-colors ${
            isProfileActive ? 'text-brand-rose font-bold' : 'text-surface/70 hover:text-surface'
          }`}
        >
          <User className={`w-5 h-5 ${isProfileActive ? 'fill-brand-rose/20 text-brand-rose' : ''}`} />
          <span>Personal</span>
        </Link>
      </nav>
    </>
  );
};

export default StorefrontFooter;