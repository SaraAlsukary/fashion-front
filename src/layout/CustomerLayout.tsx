import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    User,
    Package,
    Store,
    Heart,
    ShoppingBag,
    Settings,
    LogOut,
    ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStorefrontCartFav } from '../context/StorefrontCartFavContext';

export interface ProfileTabItem {
    id: string;
    label: string;
    to: string;
    icon: React.ElementType;
    badge?: number;
    end?: boolean;
}

interface ProfileLayoutProps {
    hasShops?: boolean;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ hasShops = true }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { favoriteIds, cartItems } = useStorefrontCartFav();

    const [confirmLogout, setConfirmLogout] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const displayName = user?.name || 'مستخدم';
    const displayEmail = user?.email || '';
    const favoritesCount = favoriteIds?.length ?? 0;
    const cartCount =
        cartItems?.reduce((sum, item) => sum + (item.quantity ?? 1), 0) ?? 0;

    const tabs: ProfileTabItem[] = [
        {
            id: 'info',
            label: 'معلومات المستخدم',
            to: '/customer',
            icon: User,
            end: true,
        },
        {
            id: 'orders',
            label: 'طلباتي',
            to: '/customer/orders',
            icon: Package,
        },
        ...(hasShops
            ? [
                {
                    id: 'shops',
                    label: 'متاجري',
                    to: '/customer/shops',
                    icon: Store,
                },
            ]
            : []),
        {
            id: 'favorites',
            label: 'المفضلة',
            to: '/customer/favorites',
            icon: Heart,
            badge: favoritesCount > 0 ? favoritesCount : undefined,
        },
        {
            id: 'cart',
            label: 'السلة',
            to: '/customer/cart',
            icon: ShoppingBag,
            badge: cartCount > 0 ? cartCount : undefined,
        },
        {
            id: 'settings',
            label: 'الإعدادات',
            to: '/customer/settings',
            icon: Settings,
        },
    ];

    const handleConfirmLogout = async () => {
        try {
            setLoggingOut(true);
            await logout();
            navigate('/login');
        } finally {
            setLoggingOut(false);
            setConfirmLogout(false);
        }
    };

    return (
        <div
            dir="rtl"
        >
            <div className="w-full mx-auto flex-1 flex flex-col gap-5 lg:gap-6">
                {/* رأس الصفحة الأفقي العريض */}
                <header className="w-full  bg-gradient-to-l from-brand via-brand to-brand-dark text-surface px-5 py-5 sm:px-7 sm:py-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface/15 border border-surface/30 flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0">
                            {displayName.trim().charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] sm:text-xs text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full">
                                    حساب الزبون
                                </span>
                                {user?.role && (
                                    <span className="text-[11px] text-white/75 uppercase tracking-wide">
                                        {user.role}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-lg sm:text-2xl font-bold truncate">
                                {displayName}
                            </h1>
                            {displayEmail && (
                                <p
                                    className="text-xs sm:text-sm text-white/85 truncate text-right"
                                    dir="ltr"
                                >
                                    {displayEmail}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => navigate('/customer/settings')}
                            className="px-3.5 py-2 rounded-xl bg-surface/10 hover:bg-surface/20 border border-surface/20 text-xs font-semibold transition-colors cursor-pointer"
                        >
                            الإعدادات
                        </button>

                        <button
                            type="button"
                            onClick={() => setConfirmLogout(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface text-brand hover:bg-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>تسجيل الخروج</span>
                        </button>
                    </div>
                </header>

                {/* منطقة العمل الرئيسية: قائمة جانبية في الديسكتوب + شريط تبويبات مرن بدون سكرول أفقي في الجوال */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
                    {/* شريط التابات */}
                    <aside className="lg:col-span-3 xl:col-span-3">
                        <div className="bg-surface border border-brand-neutral/80 rounded-2xl p-2.5 sm:p-3 shadow-sm lg:sticky lg:top-24">
                            <nav
                                aria-label="قائمة الحساب الشخصي"
                                className="flex flex-wrap lg:flex-col gap-1.5 sm:gap-2"
                            >
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <NavLink
                                            key={tab.id}
                                            to={tab.to}
                                            end={tab.end}
                                            className={({ isActive }) =>
                                                `group flex items-center justify-between gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-grow sm:flex-grow-0 justify-center sm:justify-between ${isActive
                                                    ? 'bg-brand text-surface shadow-sm'
                                                    : 'bg-brand-neutral/25 lg:bg-transparent text-brand-charcoal hover:bg-brand-neutral/50 hover:text-brand'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <Icon
                                                            className={`w-4 h-4 shrink-0 ${isActive
                                                                ? 'text-surface'
                                                                : 'text-gray-500 group-hover:text-brand'
                                                                }`}
                                                        />
                                                        <span>{tab.label}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        {tab.badge !== undefined && (
                                                            <span
                                                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isActive
                                                                    ? 'bg-surface text-brand'
                                                                    : 'bg-brand/10 text-brand'
                                                                    }`}
                                                            >
                                                                {tab.badge}
                                                            </span>
                                                        )}
                                                        <ChevronLeft
                                                            className={`hidden lg:block w-4 h-4 transition-transform ${isActive
                                                                ? 'text-surface'
                                                                : 'text-gray-400 group-hover:-translate-x-0.5'
                                                                }`}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </NavLink>
                                    );
                                })}

                                <div className="hidden lg:block my-1 border-t border-gray-100" />

                                <button
                                    type="button"
                                    onClick={() => setConfirmLogout(true)}
                                    className="hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 shrink-0" />
                                    <span>تسجيل الخروج</span>
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* مساحة المحتوى الرئيسية الممتدة بالطول */}
                    <section className="lg:col-span-9 xl:col-span-9 bg-surface border border-brand-neutral/80 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm min-h-[520px] lg:min-h-[calc(100vh-15rem)] flex flex-col">
                        <div className="flex-1">
                            <Outlet />
                        </div>
                    </section>
                </div>
            </div>

            {/* نافذة تأكيد تسجيل الخروج */}
            {confirmLogout && (
                <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-4">
                    <div className="bg-surface border border-gray-200 rounded-2xl max-w-sm w-full p-5 sm:p-6 space-y-4 text-right shadow-xl">
                        <div className="flex items-center gap-2.5 text-rose-600">
                            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <h2 className="text-base font-bold text-gray-900">
                                تأكيد تسجيل الخروج
                            </h2>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                disabled={loggingOut}
                                onClick={() => setConfirmLogout(false)}
                                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                disabled={loggingOut}
                                onClick={() => void handleConfirmLogout()}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                            >
                                {loggingOut ? 'جارٍ الخروج...' : 'تسجيل الخروج'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileLayout;