import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutGrid,
  Users,
  Store,
  ClipboardList,
  FolderOpen,
  Tag,
  Palette,
  Ruler,
  Settings,
  CreditCard,
  Repeat,
  LogOut,
  Search,
  User,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'لوحة التحكم', to: '/admin', icon: LayoutGrid },
  { label: 'المستخدمون', to: '/admin/users', icon: Users },
  { label: 'المتاجر', to: '/admin/markets', icon: Store },
  { label: 'الطلبات', to: '/admin/orders', icon: ClipboardList },
  { label: 'الفئات', to: '/admin/categories', icon: FolderOpen },
  { label: 'العلامات التجارية', to: '/admin/brands', icon: Tag },
  { label: 'الألوان', to: '/admin/colors', icon: Palette },
  { label: 'المقاسات', to: '/admin/sizes', icon: Ruler },
  { label: 'الإعدادات', to: '/admin/settings', icon: Settings },
  { label: 'الدفع', to: '/admin/payments', icon: CreditCard },
  { label: 'الاشتراكات', to: '/admin/subscriptions', icon: Repeat },
];

interface AdminLayoutProps {
  userName?: string;
  onSearchChange?: (value: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  userName,
  onSearchChange,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = userName || user?.name || user?.email || 'المسؤول';

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
    <div className="flex flex-col h-full bg-gradient-to-b from-brand to-brand-dark text-surface select-none">
      {/* اللوغو */}
      <div className="pt-6 pb-4 px-5 text-center shrink-0">
        <span className="text-4xl font-bold tracking-tight text-surface">
          اللوغو
        </span>
      </div>

      {/* قائمة التنقل */}
      <nav className="flex-1 overflow-y-auto no-scrollbar pl-3 pr-0 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 pr-5 pl-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-surface text-brand rounded-l-full font-bold shadow-xs'
                  : 'text-surface/95 hover:bg-brand-dark/70 rounded-l-full'
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${
                  isActive ? 'text-brand' : 'text-surface'
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
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-surface hover:bg-brand-dark/70 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span>{isLoggingOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen flex bg-surface text-brand-ink">
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
            className="flex-1 bg-brand-ink/40 flex items-start justify-end p-4 text-surface"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* مساحة المحتوى */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* الهيدر العلوي */}
        <header className="h-20 bg-surface px-4 md:px-8 flex items-center justify-between gap-4">
          {/* شريط البحث */}
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-brand-charcoal/70 absolute right-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="ابحث عن المبيعات و المتاجر ,غيرها....."
                className="w-full pr-10 pl-4 py-2 text-xs md:text-sm bg-surface-muted/70 border border-brand-neutral rounded-xl text-brand-ink placeholder-brand-charcoal/70 focus:outline-none focus:bg-surface focus:border-brand transition-colors"
              />
            </div>
          </div>

          {/* بطاقة المستخدم */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-brand hover:bg-surface-muted cursor-pointer"
              aria-label="فتح القائمة"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="text-left leading-snug">
              <p className="text-xs md:text-sm font-bold text-brand-ink">
                اهلا بك
              </p>
              <p className="text-xs md:text-sm text-brand-charcoal">
                {displayName}
              </p>
            </div>

            <div className="w-12 h-12 rounded-full border-2 border-brand flex items-center justify-center bg-surface-muted shrink-0">
              <User className="w-7 h-7 text-brand stroke-[1.75]" />
            </div>
          </div>
        </header>

        {/* محتوى الصفحة */}
        <main className="flex-1 px-4 md:px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;