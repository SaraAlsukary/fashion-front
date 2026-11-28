import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  Check,
  Minus,
  Plus,
  Trash2,
  Heart,
  Sparkles,
} from 'lucide-react';
import {
  useStorefrontCartFav,
  type CartItem,
} from '../../context/StorefrontCartFavContext';

const colorDotMap: Record<string, string> = {
  black: '#171717',
  navy: '#1e3a5f',
  beige: '#e5d892',
  white: '#f8fafc',
  red: '#dc2626',
  burgundy: '#642b3d',
};

const CustomerCartTab: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateCartQuantity,
    toggleCartItemSelected,
    removeCartItem,
    clearSelectedCartItems,
  } = useStorefrontCartFav();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

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
    <div className="space-y-6">
      {/* رأس التاب */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-brand-ink">
              سلة التسوق ({cartItems.length})
            </h2>
            <p className="text-xs text-gray-500">
              إدارة المنتجات المضافة حسب المتجر وتأكيد طلبك
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/customer/favorites')}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-brand text-xs font-semibold text-gray-700 hover:text-brand transition-colors cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5 text-brand" />
          <span>المفضلة</span>
        </button>
      </div>

      {/* حالة السلة الفارغة */}
      {cartItems.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
          <div className="relative w-32 h-32 rounded-full bg-brand/10 flex items-center justify-center">
            <div className="w-20 h-16 rounded-xl bg-amber-300 border-2 border-amber-900/35 shadow-sm flex flex-col items-center justify-center -rotate-6">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                <span>•</span>
                <span>•</span>
              </div>
              <div className="w-5 h-2 border-b-2 border-amber-950 rounded-b-full mt-0.5" />
              <span className="w-9 h-1.5 bg-amber-950/25 rounded-full mt-1.5" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-brand-ink">
              سلتك فاضية
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              تبحث عن منتجات مميزة لإضافتها إلى سلتك؟
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 py-3 px-7 rounded-xl bg-brand hover:bg-brand-dark text-surface text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>تسوق الآن</span>
          </Link>
        </div>
      ) : (
        /* حالة السلة الممتلئة المجمّعة حسب المتجر */
        <div className="space-y-6">
          {groupedByShop.map(([shopName, items]) => (
            <section key={shopName} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-brand-ink">{shopName}</h3>
                <span className="text-[11px] text-gray-400">
                  {items.length} {items.length === 1 ? 'منتج' : 'منتجات'}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const swatch =
                    item.colorHex ||
                    colorDotMap[(item.colorName || '').toLowerCase()] ||
                    '#E5D892';

                  return (
                    <div
                      key={item.key}
                      className="bg-surface border border-brand-neutral/80 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-2xs hover:border-brand/30 transition-colors"
                    >
                      {/* مربع التحديد وأزرار التحكم بالكمية */}
                      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleCartItemSelected(item.key)}
                          aria-label={`تحديد ${item.name}`}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                            item.selected
                              ? 'bg-brand border-brand text-surface'
                              : 'border-gray-300 bg-surface text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </button>

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

                      {/* تفاصيل المنتج */}
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
                        className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-brand-neutral/20 border border-brand-neutral/60 shrink-0"
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

          {/* ملخص المجموع وزر تأكيد الشراء */}
          <div className="pt-2 space-y-4 border-t border-gray-100">
            <div className="bg-brand-neutral/25 border border-brand-neutral/80 rounded-2xl px-4 py-3.5 flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-brand-ink">
                إجمالي العناصر المحددة ({selectedItems.length})
              </span>
              <span className="text-base sm:text-lg font-extrabold text-brand" dir="ltr">
                {selectedTotal}$
              </span>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isCheckingOut || selectedItems.length === 0}
                onClick={handleConfirmPurchase}
                className="w-full sm:w-auto min-w-[240px] py-3 px-7 rounded-xl bg-brand hover:bg-brand-dark disabled:opacity-50 text-surface text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                {isCheckingOut ? 'جاري تأكيد الطلب...' : 'تأكيد عملية الشراء'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCartTab;