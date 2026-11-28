import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Plus,
    X,
    ShoppingBag,
    Heart,
    MessageCircle,
    Minus,
    Trash2,
    Check,
    ArrowUpLeft,
} from 'lucide-react';
import {
    useStorefrontCartFav,
    type CartItem,
} from '../context/StorefrontCartFavContext';

const colorDotMap: Record<string, string> = {
    black: '#171717',
    navy: '#1e3a5f',
    beige: '#e5d892',
    white: '#f8fafc',
    red: '#dc2626',
    burgundy: '#642b3d',
};

interface FloatingDockAndCartSidebarProps {
    whatsappUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    externalCartOpen?: boolean;
    onExternalCartOpenChange?: (open: boolean) => void;
}

const FloatingDockAndCartSidebar: React.FC<FloatingDockAndCartSidebarProps> = ({
    whatsappUrl = 'https://wa.me/963900000000',
    instagramUrl = 'https://instagram.com',
    facebookUrl = 'https://facebook.com',
    externalCartOpen,
    onExternalCartOpenChange,
}) => {
    const navigate = useNavigate();
    const {
        favoriteIds,
        cartItems,
        totalBagCount,
        updateCartQuantity,
        toggleCartItemSelected,
        removeCartItem,
        clearSelectedCartItems,
    } = useStorefrontCartFav();

    const [dockOpen, setDockOpen] = useState(false);
    const [internalCartOpen, setInternalCartOpen] = useState(false);

    const isCartDrawerOpen =
        externalCartOpen !== undefined ? externalCartOpen : internalCartOpen;

    const setCartDrawerOpen = (open: boolean) => {
        if (onExternalCartOpenChange) {
            onExternalCartOpenChange(open);
        } else {
            setInternalCartOpen(open);
        }
    };

    const groupedByShop = useMemo(() => {
        const groups = new Map<string, CartItem[]>();
        cartItems.forEach((item) => {
            const key = item.shopName || 'المتجر';
            const list = groups.get(key) ?? [];
            list.push(item);
            groups.set(key, list);
        });
        return Array.from(groups.entries());
    }, [cartItems]);

    const selectedItems = useMemo(
        () => cartItems.filter((item) => item.selected),
        [cartItems]
    );

    const selectedTotal = useMemo(
        () =>
            selectedItems.reduce(
                (sum, item) => sum + Number(item.price || 0) * item.quantity,
                0
            ),
        [selectedItems]
    );

    const handleQuickCheckout = () => {
        if (selectedItems.length === 0) {
            toast.error('يرجى تحديد منتج واحد على الأقل');
            return;
        }
        clearSelectedCartItems();
        setCartDrawerOpen(false);
        toast.success('تم تأكيد طلبك بنجاح!');
    };

    return (
        <>
            {/* 1. مجموعة الأزرار العائمة في أسفل الشاشة */}
            <div
                dir="rtl"
                className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40 flex flex-col items-start gap-2.5"
            >
                {/* الأزرار الفرعية عند فتح القائمة العائمة */}
                {dockOpen && (
                    <div className="flex flex-col items-start gap-2.5 animate-fade-in">
                        {/* زر السلة (يفتح الـ Sidebar الجانبي) */}
                        <button
                            type="button"
                            onClick={() => {
                                setDockOpen(false);
                                setCartDrawerOpen(true);
                            }}
                            className="group flex items-center gap-2.5 bg-surface hover:bg-surface-muted text-brand-ink border border-brand-neutral shadow-lg rounded-full pl-3.5 pr-2 py-1.5 transition-all cursor-pointer"
                        >
                            <span className="relative w-9 h-9 rounded-full bg-brand text-surface flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4" />
                                {totalBagCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-mauve text-surface text-[10px] font-bold flex items-center justify-center border border-surface">
                                        {totalBagCount}
                                    </span>
                                )}
                            </span>
                            <span className="text-xs font-bold">السلة الجانبية</span>
                        </button>

                        {/* زر المفضلة */}
                        <button
                            type="button"
                            onClick={() => {
                                setDockOpen(false);
                                navigate('/favorites');
                            }}
                            className="group flex items-center gap-2.5 bg-surface hover:bg-surface-muted text-brand-ink border border-brand-neutral shadow-lg rounded-full pl-3.5 pr-2 py-1.5 transition-all cursor-pointer"
                        >
                            <span className="relative w-9 h-9 rounded-full bg-brand-wine text-surface flex items-center justify-center">
                                <Heart className="w-4 h-4" />
                                {favoriteIds.length > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-surface text-[10px] font-bold flex items-center justify-center border border-surface">
                                        {favoriteIds.length}
                                    </span>
                                )}
                            </span>
                            <span className="text-xs font-bold">المفضلة</span>
                        </button>

                        {/* أزرار وسائل التواصل الاجتماعي */}
                        {/* أزرار وسائل التواصل الاجتماعي */}
                        <div className="flex items-center gap-2 pr-1">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="واتساب"
                                title="واتساب"
                                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </a>

                            {/* أيقونة إنستغرام SVG */}
                            <a
                                href={instagramUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="إنستغرام"
                                title="إنستغرام"
                                className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                >
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </a>

                            {/* أيقونة فيسبوك SVG */}
                            <a
                                href={facebookUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="فيسبوك"
                                title="فيسبوك"
                                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                >
                                    <path d="M13.5 22v-8.2h2.7l.4-3.2h-3.1V8.6c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.5v3.2h2.8V22h3.2z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                )}

                {/* الزر العائم الرئيسي */}
                <button
                    type="button"
                    onClick={() => setDockOpen((prev) => !prev)}
                    aria-label={dockOpen ? 'إغلاق القائمة السريعة' : 'فتح القائمة السريعة'}
                    className={`w-12 h-12 md:w-13 md:h-13 rounded-full text-surface shadow-[0_10px_22px_-4px_rgba(100,43,61,0.55)] flex items-center justify-center transition-all cursor-pointer ${dockOpen
                        ? 'bg-brand-dark rotate-90'
                        : 'bg-gradient-to-br from-brand to-brand-mauve hover:scale-105'
                        }`}
                >
                    {dockOpen ? (
                        <X className="w-5 h-5" />
                    ) : (
                        <Plus className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* 2. قائمة السلة الجانبية (Cart Sidebar Drawer) */}
            {isCartDrawerOpen && (
                <div
                    dir="rtl"
                    className="fixed inset-0 z-50 flex justify-start"
                    role="dialog"
                    aria-modal="true"
                    aria-label="سلة التسوق الجانبية"
                >
                    {/* خلفية معتمة قابلة للنقر للإغلاق */}
                    <div
                        onClick={() => setCartDrawerOpen(false)}
                        className="fixed inset-0 bg-brand-deep/45 backdrop-blur-[1px] transition-opacity"
                    />

                    {/* لوحة السلة الجانبية */}
                    <aside className="relative z-10 w-full max-w-md bg-surface h-full shadow-2xl border-l border-brand-neutral/80 flex flex-col justify-between overflow-hidden">
                        {/* رأس الـ Sidebar */}
                        <div className="bg-gradient-to-l from-brand to-brand-mauve text-surface px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="w-9 h-9 rounded-xl bg-surface/15 flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5" />
                                </span>
                                <div>
                                    <h2 className="text-base font-bold">سلة التسوق</h2>
                                    <p className="text-[11px] text-surface/85">
                                        {totalBagCount} عنصر في السلة
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    to="/cart"
                                    onClick={() => setCartDrawerOpen(false)}
                                    className="px-3 py-1.5 rounded-full bg-surface/15 hover:bg-surface/25 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                                >
                                    <span>صفحة السلة</span>
                                    <ArrowUpLeft className="w-3.5 h-3.5" />
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setCartDrawerOpen(false)}
                                    aria-label="إغلاق السلة الجانبية"
                                    className="w-8 h-8 rounded-full bg-surface/15 hover:bg-surface/25 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* محتوى العناصر في الـ Sidebar */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                                        <ShoppingBag className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-base font-bold text-brand-ink">
                                            سلتك فاضية
                                        </p>
                                        <p className="text-xs text-brand-charcoal">
                                            أضيفي منتجاتك المفضلة لتظهر هنا بسرعة.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCartDrawerOpen(false);
                                            navigate('/products');
                                        }}
                                        className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-surface text-xs font-bold shadow-md cursor-pointer"
                                    >
                                        تسوق الآن
                                    </button>
                                </div>
                            ) : (
                                groupedByShop.map(([shopName, items]) => (
                                    <div key={shopName} className="space-y-2.5">
                                        <h3 className="text-xs font-extrabold text-brand uppercase tracking-wide px-1">
                                            {shopName}
                                        </h3>

                                        <div className="space-y-2.5">
                                            {items.map((item) => {
                                                const swatch =
                                                    item.colorHex ||
                                                    colorDotMap[(item.colorName || '').toLowerCase()] ||
                                                    '#E5D892';

                                                return (
                                                    <div
                                                        key={item.key}
                                                        className="rounded-2xl border border-brand-neutral/80 bg-surface p-3 flex items-center gap-3 shadow-2xs"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCartItemSelected(item.key)}
                                                            aria-label={`تحديد ${item.name}`}
                                                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 cursor-pointer ${item.selected
                                                                ? 'bg-brand border-brand text-surface'
                                                                : 'border-gray-300 bg-surface text-transparent'
                                                                }`}
                                                        >
                                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                                        </button>

                                                        <img
                                                            crossOrigin="anonymous"
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-14 h-18 rounded-xl object-cover bg-surface-muted shrink-0"
                                                        />

                                                        <div className="flex-1 min-w-0 space-y-1">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <Link
                                                                    to={`/products/${item.productId}`}
                                                                    onClick={() => setCartDrawerOpen(false)}
                                                                    className="text-xs font-bold text-brand-ink hover:text-brand truncate"
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeCartItem(item.key)}
                                                                    aria-label="حذف"
                                                                    className="text-gray-400 hover:text-rose-600 cursor-pointer shrink-0"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center gap-2 text-[11px] text-brand-charcoal">
                                                                <span
                                                                    className="w-3 h-3 rounded-full border border-black/15 inline-block"
                                                                    style={{ backgroundColor: swatch }}
                                                                />
                                                                <span>مقاس: {item.sizeName || 'M'}</span>
                                                                <span>•</span>
                                                                <span
                                                                    className="font-bold text-brand-ink"
                                                                    dir="ltr"
                                                                >
                                                                    {Number(item.price) * item.quantity}$
                                                                </span>
                                                            </div>

                                                            <div className="inline-flex items-center rounded-lg bg-brand text-surface mt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateCartQuantity(item.key, -1)
                                                                    }
                                                                    aria-label="إنقاص الكمية"
                                                                    className="px-2 py-0.5 hover:bg-brand-dark cursor-pointer"
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </button>
                                                                <span className="px-2 text-xs font-bold">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateCartQuantity(item.key, 1)
                                                                    }
                                                                    aria-label="زيادة الكمية"
                                                                    className="px-2 py-0.5 hover:bg-brand-dark cursor-pointer"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* تذييل الـ Sidebar: المجموع وزر تأكيد الشراء */}
                        {cartItems.length > 0 && (
                            <div className="border-t border-brand-neutral/80 bg-surface-muted/70 p-4 space-y-3">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="font-bold text-brand-ink">
                                        المجموع المحدد ({selectedItems.length})
                                    </span>
                                    <span className="text-base font-extrabold text-brand" dir="ltr">
                                        {selectedTotal}$
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    disabled={selectedItems.length === 0}
                                    onClick={handleQuickCheckout}
                                    className="w-full py-3 rounded-xl bg-brand hover:bg-brand-dark disabled:opacity-50 text-surface text-sm font-bold shadow-[0_8px_16px_-4px_rgba(100,43,61,0.45)] transition-all cursor-pointer"
                                >
                                    تأكيد عملية الشراء
                                </button>
                            </div>
                        )}
                    </aside>
                </div>
            )}
        </>
    );
};

export default FloatingDockAndCartSidebar;