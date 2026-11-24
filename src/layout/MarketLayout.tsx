import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutGrid,
  GitBranch,
  Package,
  ClipboardList,
  Percent,
  MoreHorizontal,
  CreditCard,
  Star,
  LogOut,
  Search,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MarketNavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const marketNavItems: MarketNavItem[] = [
  { label: 'الرئيسية', to: '/market', icon: LayoutGrid },
  { label: 'الفروع', to: '/market/branches', icon: GitBranch },
  { label: 'المنتجات', to: '/market/products', icon: Package },
  { label: 'الطلبات', to: '/market/orders', icon: ClipboardList },
  { label: 'العروض', to: '/market/offers', icon: Percent },
  { label: 'الاشتراكات', to: '/market/subscriptions', icon: CreditCard },
  { label: 'التقييمات', to: '/market/reviews', icon: Star },
  { label: 'المزيد', to: '/market/settings', icon: MoreHorizontal },
];

interface MarketLayoutProps {
  storeName?: string;
  onSearchChange?: (value: string) => void;
}

const MarketLayout: React.FC<MarketLayoutProps> = ({
  storeName,
  onSearchChange,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayUserName =
    storeName || user?.name || user?.email || 'صاحب المتجر';

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearchChange?.(val);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('تم تسجيل الخروج بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    } finally {
      setIsLoggingOut(false);
      navigate('/', { replace: true });
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-brand text-white select-none">
      {/* شعار المتجر */}
      <div className="pt-6 pb-4 px-5 text-center shrink-0">
        <span className="text-4xl font-bold tracking-tight">المتجر</span>
      </div>

      {/* قائمة التنقل الجانبية */}
      <nav className="flex-1 overflow-y-auto no-scrollbar pl-3 pr-0 space-y-1">
        {marketNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === '/market'
              ? pathname === '/market'
              : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 pr-5 pl-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-surface text-brand rounded-l-full font-bold shadow-xs'
                  : 'text-white/95 hover:bg-brand-dark/70 rounded-l-full'
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${
                  isActive ? 'text-brand' : 'text-white'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* زر تسجيل الخروج */}
      <div className="px-4 py-4 shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark/70 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span>{isLoggingOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen flex bg-surface text-gray-800">
      {/* القائمة الجانبية للشاشات الكبيرة */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="fixed top-0 right-0 bottom-0 w-56 z-30">
          <SidebarContent />
        </div>
      </aside>

      {/* القائمة الجانبية للجوال */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-60 h-full">
            <SidebarContent />
          </div>
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setMobileMenuOpen(false)}
            className="flex-1 bg-black/40 flex items-start justify-end p-4 text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* مساحة المحتوى */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-8">
        {/* الهيدر العلوي */}
        <header className="h-20 bg-surface px-4 md:px-8 flex items-center justify-between gap-4">
          {/* شريط البحث */}
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="ابحث عن الفروع، المنتجات، الطلبات..."
                className="w-full pr-10 pl-4 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>

          {/* بطاقة التاجر */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-brand hover:bg-surface-muted"
              aria-label="فتح القائمة"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="text-left leading-snug">
              <p className="text-xs md:text-sm font-bold text-gray-900">
                اهلا بك
              </p>
              <p className="text-xs md:text-sm text-gray-600">
                {displayUserName}
              </p>
            </div>

            <div className="w-12 h-12 rounded-full border-2 border-gray-800 flex items-center justify-center bg-surface shrink-0">
              <User className="w-7 h-7 text-gray-800 stroke-[1.75]" />
            </div>
          </div>
        </header>

        {/* محتوى الصفحة */}
        <main className="flex-1 px-4 md:px-8">
          <Outlet />
        </main>
      </div>

      {/* شريط التنقل السفلي للجوال */}
      <nav
        aria-label="التنقل السفلي للمتجر"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-gray-200 px-2 py-1.5 flex items-center justify-around"
      >
        {marketNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === '/market'
              ? pathname === '/market'
              : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                isActive ? 'text-brand font-bold' : 'text-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MarketLayout;