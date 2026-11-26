import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    MapPin,
    Heart,
    ShoppingBag,
    Search,
    SlidersHorizontal,
    ChevronDown,
    Check,
    User,
    LogIn,
    LogOut,
    LayoutDashboard,
} from 'lucide-react';
import type { HomeCategory } from '../services/homeService';
import { useAuth } from '../context/AuthContext';
import { useStorefrontCartFav } from '../context/StorefrontCartFavContext';

export interface StorefrontHeaderProps {
    locationLabel?: string;
    onToggleLocation?: () => void;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    categories?: HomeCategory[];
    selectedCategorySlug?: string;
    onSelectCategory?: (slug: string) => void;
    selectedSize?: string;
    onSelectSize?: (size: string) => void;
    priceSort?: 'none' | 'asc' | 'desc';
    onChangePriceSort?: (sort: 'none' | 'asc' | 'desc') => void;
    favoriteCount?: number;
    bagCount?: number;
    loginPath?: string;
}

const categoryArabicLabels: Record<string, string> = {
    women: 'نسائي',
    men: 'رجالي',
    dresses: 'فساتين',
    bags: 'حقائب',
    shoes: 'أحذية',
    accessories: 'إكسسوارات',
    jackets: 'جاكيتات',
    casual: 'كاجوال',
    formal: 'رسمي',
};

const StorefrontHeader: React.FC<StorefrontHeaderProps> = ({
    locationLabel = 'حلب، الفرقان',
    onToggleLocation,
    searchQuery = '',
    onSearchChange,
    categories = [],
    selectedCategorySlug = '',
    onSelectCategory,
    selectedSize = '',
    onSelectSize,
    priceSort = 'none',
    onChangePriceSort,
    loginPath = '/login',
}) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { user, role, isAuthenticated, isLoading, logout } = useAuth();
    const { favorites, totalBagCount } = useStorefrontCartFav();

    const resolvedFavoriteCount = favorites.length;
    const resolvedBagCount = totalBagCount;

    const [filterOpen, setFilterOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const userMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLocationClick = () => {
        if (onToggleLocation) {
            onToggleLocation();
        }
    };

    const getDashboardRoute = () => {
        if (role === 'ADMIN') return '/admin';
        if (role === 'SHOP_OWNER') return '/market';
        return '/profile';
    };

    const getDashboardLabel = () => {
        if (role === 'ADMIN') return 'لوحة الإدارة';
        if (role === 'SHOP_OWNER') return 'لوحة المتجر';
        return 'حسابي';
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await logout();
            setUserMenuOpen(false);
            toast.success('تم تسجيل الخروج بنجاح');
        } catch {
            toast.error('تعذر تسجيل الخروج، حاول مرة أخرى');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const displayName = user?.name || user?.email || 'المستخدم';

    return (
        <header className="relative bg-gradient-to-b from-brand-plum to-brand-rose text-surface pt-4 pb-10 px-4 md:px-10">
            <div className="max-w-6xl mx-auto space-y-4">
                {/* الصف العلوي: الموقع + روابط سطح المكتب + المفضلة والسلة وحالة المستخدم */}
                <div className="flex items-center justify-between gap-3">
                    {/* الموقع */}
                    <button
                        type="button"
                        onClick={handleLocationClick}
                        className="text-right group cursor-pointer"
                    >
                        <span className="text-[11px] text-surface/80 flex items-center gap-1">
                            <span>Location</span>
                            <ChevronDown className="w-3 h-3" />
                        </span>
                        <span className="text-xs md:text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-4 h-4 text-surface shrink-0" />
                            <span>{locationLabel}</span>
                        </span>
                    </button>

                    {/* روابط التنقل لسطح المكتب */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-surface/95">
                        <Link
                            to="/"
                            className={
                                pathname === '/'
                                    ? 'font-bold underline underline-offset-8'
                                    : 'hover:text-surface/80 transition-colors'
                            }
                        >
                            الرئيسية
                        </Link>
                        <Link
                            to="/shops"
                            className={
                                pathname.startsWith('/shops')
                                    ? 'font-bold underline underline-offset-8'
                                    : 'hover:text-surface/80 transition-colors'
                            }
                        >
                            المتاجر
                        </Link>
                        <Link
                            to="/products"
                            className={
                                pathname.startsWith('/products')
                                    ? 'font-bold underline underline-offset-8'
                                    : 'hover:text-surface/80 transition-colors'
                            }
                        >
                            المنتجات
                        </Link>
                        <Link
                            to="/offers"
                            className={
                                pathname.startsWith('/offers')
                                    ? 'font-bold underline underline-offset-8'
                                    : 'hover:text-surface/80 transition-colors'
                            }
                        >
                            العروض
                        </Link>
                    </nav>

                    {/* أيقونات القلب والسلة + زر تسجيل الدخول أو أيقونة المستخدم */}
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => navigate('/favorites')}
                            aria-label="المفضلة"
                            className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface/90 hover:bg-surface text-brand-rose shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                        >
                            <Heart
                                className={`w-4 h-4 md:w-5 md:h-5 ${
                                    resolvedFavoriteCount > 0
                                        ? 'fill-brand-rose'
                                        : 'fill-brand-rose/20'
                                }`}
                            />
                            {resolvedFavoriteCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-brand text-surface text-[10px] font-bold flex items-center justify-center">
                                    {resolvedFavoriteCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/cart')}
                            aria-label="السلة"
                            className="relative w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface/90 hover:bg-surface text-brand-rose shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                        >
                            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                            {resolvedBagCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-brand text-surface text-[10px] font-bold flex items-center justify-center">
                                    {resolvedBagCount}
                                </span>
                            )}
                        </button>

                        {isLoading ? (
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface/25 animate-pulse shrink-0" />
                        ) : isAuthenticated ? (
                            <div ref={userMenuRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setUserMenuOpen((prev) => !prev)}
                                    aria-label="حساب المستخدم"
                                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface/95 hover:bg-surface text-brand shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                                >
                                    <User className="w-4 h-4 md:w-5 md:h-5 stroke-[2.2]" />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute left-0 top-12 z-50 w-56 bg-surface text-brand-charcoal rounded-2xl shadow-xl border border-brand-neutral/60 p-2 space-y-1">
                                        <div className="px-3 py-2 border-b border-gray-100 text-right">
                                            <p className="text-xs font-bold text-gray-900 truncate">
                                                {displayName}
                                            </p>
                                            {user?.email && (
                                                <p className="text-[11px] text-gray-500 truncate" dir="ltr">
                                                    {user.email}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                navigate(getDashboardRoute());
                                            }}
                                            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-surface-muted flex items-center gap-2 text-right transition-colors cursor-pointer"
                                        >
                                            <LayoutDashboard className="w-4 h-4 text-brand shrink-0" />
                                            <span>{getDashboardLabel()}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 text-right transition-colors cursor-pointer disabled:opacity-60"
                                        >
                                            <LogOut className="w-4 h-4 shrink-0" />
                                            <span>
                                                {isLoggingOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => navigate(loginPath)}
                                className="h-9 md:h-10 px-3.5 md:px-4 rounded-full bg-surface hover:bg-surface/95 text-brand text-xs md:text-sm font-bold shadow-md inline-flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shrink-0"
                            >
                                <LogIn className="w-4 h-4 shrink-0" />
                                <span>تسجيل الدخول</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* شريط البحث + زر الفلتر المنسدل */}
                {onSearchChange && (
                    <div className="relative max-w-2xl mx-auto flex items-center gap-2.5">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="ابحث عن ملابس، أحذية، حقائب....."
                                className="w-full h-10 md:h-11 pr-4 pl-10 rounded-lg bg-surface/25 backdrop-blur-xs text-surface placeholder-surface/85 text-xs md:text-sm border border-surface/20 focus:outline-none focus:bg-surface/30"
                            />
                            <Search className="w-4 h-4 md:w-5 md:h-5 text-surface absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {onSelectCategory && onSelectSize && onChangePriceSort && (
                            <button
                                type="button"
                                onClick={() => setFilterOpen((prev) => !prev)}
                                aria-label="تصفية النتائج"
                                className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-surface/25 hover:bg-surface/35 border border-surface/20 shadow-sm flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            >
                                <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5 text-surface" />
                            </button>
                        )}

                        {filterOpen && onSelectCategory && onSelectSize && onChangePriceSort && (
                            <div className="absolute left-0 top-12 z-40 w-72 sm:w-80 bg-surface text-brand-charcoal rounded-2xl shadow-xl border border-brand-neutral/60 p-4 space-y-3.5">
                                {categories.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-brand-ink">نوع الثياب</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {categories.slice(0, 6).map((cat) => {
                                                const active = selectedCategorySlug === cat.slug;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() =>
                                                            onSelectCategory(active ? '' : cat.slug)
                                                        }
                                                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                                                            active
                                                                ? 'bg-brand text-surface'
                                                                : 'bg-surface-muted text-brand-charcoal hover:bg-brand-neutral/60'
                                                        }`}
                                                    >
                                                        {categoryArabicLabels[cat.slug] ?? cat.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold text-brand-ink">الحجم</p>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {['XS', 'S', 'M', 'L', 'XL'].map((sz) => {
                                            const active = selectedSize === sz;
                                            return (
                                                <button
                                                    key={sz}
                                                    type="button"
                                                    onClick={() => onSelectSize(active ? '' : sz)}
                                                    className={`py-1 rounded border text-[11px] font-semibold cursor-pointer ${
                                                        active
                                                            ? 'bg-brand text-surface border-brand'
                                                            : 'border-brand-neutral text-brand-charcoal hover:border-brand'
                                                    }`}
                                                >
                                                    {sz}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <p className="text-xs font-bold text-brand-ink">السعر</p>
                                    <div className="space-y-1.5 text-xs">
                                        {[
                                            { code: 'desc', label: 'من الأغلى للأرخص' },
                                            { code: 'asc', label: 'من الأرخص للأغلى' },
                                        ].map((opt) => {
                                            const checked = priceSort === opt.code;
                                            return (
                                                <button
                                                    key={opt.code}
                                                    type="button"
                                                    onClick={() =>
                                                        onChangePriceSort(
                                                            checked ? 'none' : (opt.code as 'asc' | 'desc')
                                                        )
                                                    }
                                                    className="w-full px-3 py-1.5 rounded-lg border border-brand-neutral flex items-center justify-between text-brand-charcoal hover:border-brand cursor-pointer"
                                                >
                                                    <span>{opt.label}</span>
                                                    <span
                                                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                                                            checked
                                                                ? 'bg-brand border-brand text-surface'
                                                                : 'border-brand-neutral'
                                                        }`}
                                                    >
                                                        {checked && <Check className="w-3 h-3" />}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* القوس السفلي للهيدر */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -bottom-px h-6 bg-surface"
                style={{
                    clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                }}
            />
        </header>
    );
};

export default StorefrontHeader;