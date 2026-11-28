import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Check,
  Minus,
  Plus,
  Trash2,
  ChevronLeft,
  Heart,
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

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateCartQuantity,
    toggleCartItemSelected,
    removeCartItem,
    clearSelectedCartItems,
  } = useStorefrontCartFav();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // تجميع عناصر السلة حسب اسم المتجر (كما في الصورة: ZARA، Chanel...)
  const groupedByShop = useMemo(() => {
    const groups = new Map<string, CartItem[]>();
    cartItems.forEach((item) => {
      const shopKey = item.shopName || 'المتجر';
      const list = groups.get(shopKey) ?? [];
      list.push(item);
      groups.set(shopKey, list);
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

  const handleConfirmPurchase = () => {
    if (selectedItems.length === 0) {
      toast.error('يرجى تحديد منتج واحد على الأقل لتأكيد الشراء');
      return;
    }
    setIsCheckingOut(true);
    setTimeout(() => {
      clearSelectedCartItems();
      setIsCheckingOut(false);
      toast.success('تم تأكيد طلبك بنجاح! شكراً لتسوقك معنا');
    }, 500);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 py-5 space-y-6">
      {/* الهيدر العلوي للسلة المطابق للصورة */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="رجوع"
            className="w-9 h-9 rounded-full bg-surface border border-brand-neutral/70 shadow-sm flex items-center justify-center text-brand-charcoal hover:text-brand cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/favorites')}
            aria-label="المفضلة"
            className="w-9 h-9 rounded-full bg-surface border border-brand-neutral/70 shadow-sm flex items-center justify-center text-brand-charcoal/60 hover:text-brand cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <h1 className="text-lg md:text-xl font-bold text-brand-ink">السلة</h1>
          <span className="w-6 h-6 rounded-md bg-brand-ink text-surface text-xs font-bold flex items-center justify-center">
            <ShoppingBag className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* حالة السلة الفارغة المطابقة للصورة */}
      {cartItems.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center space-y-5">
          {/* رسم توضيحي لصندوق تسوق مرح */}
          <div className="relative w-36 h-36 rounded-full bg-lime-700/20 flex items-center justify-center">
            <div className="w-24 h-20 rounded-xl bg-amber-300 border-2 border-amber-900/40 shadow-md flex flex-col items-center justify-center relative -rotate-6">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                <span>•</span>
                <span>•</span>
              </div>
              <div className="w-5 h-2.5 border-b-2 border-amber-950 rounded-b-full mt-0.5" />
              <span className="w-10 h-1.5 bg-amber-950/30 rounded-full mt-2" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-bold text-brand-ink">
              سلتك فاضية
            </h2>
            <p className="text-xs md:text-sm text-brand-charcoal">
              تبحث عن منتجات
            </p>
          </div>

          <Link
            to="/"
            className="w-full max-w-xs py-3 px-8 rounded-xl bg-brand hover:bg-brand-dark text-surface text-sm font-bold shadow-[0_8px_16px_-4px_rgba(100,43,61,0.45)] transition-all"
          >
            تسوق الان
          </Link>
        </div>
      ) : (
        /* حالة السلة الممتلئة المجمّعة حسب المتجر */
        <div className="space-y-6">
          {groupedByShop.map(([shopName, items]) => (
            <section key={shopName} className="space-y-3">
              <h2 className="text-sm md:text-base font-bold text-brand-ink px-1">
                {shopName}
              </h2>

              <div className="space-y-3">
                {items.map((item) => {
                  const swatch =
                    item.colorHex ||
                    colorDotMap[(item.colorName || '').toLowerCase()] ||
                    '#E5D892';

                  return (
                    <div
                      key={item.key}
                      className="bg-surface border border-brand-neutral/80 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      {/* مربع التحديد وأزرار التحكم بالكمية */}
                      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleCartItemSelected(item.key)}
                          aria-label={`تحديد ${item.name}`}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${item.selected
                              ? 'bg-brand border-brand text-surface'
                              : 'border-gray-300 bg-surface text-transparent'
                            }`}
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {/* شريط الكمية العنابي (- 1 +) كما في الصورة */}
                        <div className="inline-flex items-center rounded-lg bg-brand text-surface overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.key, -1)}
                            aria-label="إنقاص الكمية"
                            className="px-2 py-1.5 hover:bg-brand-dark transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.key, 1)}
                            aria-label="زيادة الكمية"
                            className="px-2 py-1.5 hover:bg-brand-dark transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* تفاصيل المنتج (السعر، المقاس، اللون) */}
                      <div className="flex-1 min-w-0 text-right space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.key)}
                            aria-label={`حذف ${item.name}`}
                            className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <Link
                            to={`/products/${item.productId}`}
                            className="text-xs sm:text-sm font-bold text-brand-ink hover:text-brand truncate"
                          >
                            {item.name}
                          </Link>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-brand-charcoal pt-0.5">
                          <div>
                            <span className="block text-gray-400">اللون</span>
                            <span
                              className="inline-block w-3.5 h-3.5 rounded-full mt-1 border border-black/10"
                              style={{ backgroundColor: swatch }}
                              title={item.colorName || 'اللون'}
                            />
                          </div>

                          <div>
                            <span className="block text-gray-400">المقاس</span>
                            <span className="inline-block mt-0.5 font-bold text-brand-ink">
                              {item.sizeName || 'M'}
                            </span>
                          </div>

                          <div>
                            <span className="block text-gray-400">السعر</span>
                            <span
                              className="inline-block mt-0.5 font-bold text-brand-ink"
                              dir="ltr"
                            >
                              {Number(item.price) * item.quantity}$
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* صورة المنتج */}
                      <Link
                        to={`/products/${item.productId}`}
                        className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-surface-muted border border-brand-neutral/60 shrink-0"
                      >
                        <img
                          crossOrigin="anonymous"
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* ملخص المجموع وزر تأكيد عملية الشراء */}
          <div className="pt-3 space-y-4">
            <div className="bg-surface-muted/80 border border-brand-neutral/70 rounded-2xl px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-brand-ink">
                إجمالي العناصر المحددة ({selectedItems.length})
              </span>
              <span className="text-base font-extrabold text-brand" dir="ltr">
                {selectedTotal}$
              </span>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                disabled={isCheckingOut || selectedItems.length === 0}
                onClick={handleConfirmPurchase}
                className="w-full max-w-sm py-3.5 px-8 rounded-xl bg-brand hover:bg-brand-dark disabled:opacity-50 text-surface text-sm font-bold shadow-[0_8px_18px_-4px_rgba(100,43,61,0.5)] transition-all cursor-pointer"
              >
                {isCheckingOut
                  ? 'جاري تأكيد الطلب...'
                  : 'تأكيد عملية الشراء'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;