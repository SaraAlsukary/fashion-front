import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Store,
  Package,
  MapPin,
  Star,
  ArrowUpLeft,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  shopsService,
  isValidImageUrl,
  type ShopListItem,
} from '../services/shopsService';

const fallbackCover =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80';

const fallbackLogo =
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=200&q=80';

const Shops: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['shops', 'list'],
    queryFn: () => shopsService.getAll(),
  });

  const shops = data?.shops ?? [];

  const filteredShops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(q) ||
        Boolean(shop.description?.toLowerCase().includes(q))
    );
  }, [shops, searchQuery]);

  const handleOpenShop = (shop: ShopListItem) => {
    navigate(`/shops/${shop.id}`);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-surface text-gray-800">
      <main className="max-w-6xl mx-auto px-4 md:px-10 py-8 pb-14 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              المتاجر
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              استعرض المتاجر المعتمدة وتصفح منتجاتها وفروعها
            </p>
          </div>

          {!isLoading && !isError && (
            <span className="px-3.5 py-1.5 rounded-full bg-surface-muted text-xs font-semibold text-gray-700">
              {filteredShops.length} متجر
            </span>
          )}
        </div>

        {/* شريط البحث */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن متجر..."
            className="w-full pr-10 pl-4 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        {/* حالة التحميل */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 overflow-hidden bg-surface animate-pulse"
              >
                <div className="h-36 bg-gray-200" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* حالة الخطأ */}
        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-700">
              تعذر تحميل قائمة المتاجر حالياً
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        )}

        {/* قائمة فارغة */}
        {!isLoading && !isError && filteredShops.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-surface-muted/50 p-10 text-center space-y-2">
            <Store className="w-9 h-9 text-brand mx-auto" />
            <p className="text-sm font-bold text-gray-800">
              لا توجد متاجر مطابقة لبحثك
            </p>
            <p className="text-xs text-gray-500">
              جرّب كلمة بحث أخرى أو امسح حقل البحث لعرض جميع المتاجر.
            </p>
          </div>
        )}

        {/* شبكة المتاجر */}
        {!isLoading && !isError && filteredShops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredShops.map((shop) => {
              const coverSrc = isValidImageUrl(shop.cover_image)
                ? shop.cover_image!
                : fallbackCover;
              const logoSrc = isValidImageUrl(shop.logo)
                ? shop.logo!
                : fallbackLogo;

              return (
                <article
                  key={shop.id}
                  onClick={() => handleOpenShop(shop)}
                  className="group bg-surface border border-gray-200 hover:border-brand rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col cursor-pointer"
                >
                  <div className="relative h-36 bg-brand-soft overflow-hidden">
                    <img
                      src={coverSrc}
                      alt={shop.name}
                      onError={(e) => {
                        e.currentTarget.src = fallbackCover;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    <div className="absolute bottom-3 right-3 w-14 h-14 rounded-xl bg-surface border-2 border-surface shadow-md overflow-hidden flex items-center justify-center">
                      <img
                        src={logoSrc}
                        alt={shop.name}
                        onError={(e) => {
                          e.currentTarget.src = fallbackLogo;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-gray-900 group-hover:text-brand transition-colors truncate">
                          {shop.name}
                        </h2>
                        <ArrowUpLeft className="w-4 h-4 text-gray-400 group-hover:text-brand shrink-0 transition-colors" />
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 min-h-[2rem]">
                        {shop.description || 'متجر أزياء ومنتجات متنوعة'}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-brand" />
                        <span>{shop._count?.products ?? 0} منتج</span>
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand" />
                        <span>{shop._count?.branches ?? 0} فرع</span>
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{shop._count?.reviews ?? 0} تقييم</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Shops;