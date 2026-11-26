import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag,
  Percent,
  Calendar,
  Store,
  ArrowUpLeft,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useOffers } from '../hooks/useOffers';
import {
  isValidImageUrl,
  getOfferTitle,
  formatOfferDiscount,
  type OfferItem,
} from '../services/offersService';

const fallbackOfferImage =
  'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=900&q=80';

const formatDateAr = (value?: string | null): string | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('ar-SY');
};

const isOfferActive = (offer: OfferItem): boolean => {
  if (typeof offer.is_active === 'boolean') return offer.is_active;
  if (offer.status) {
    const s = offer.status.toLowerCase();
    if (s === 'inactive' || s === 'expired' || s === 'ended') return false;
  }
  const endDateStr = offer.end_date ?? offer.expires_at;
  if (endDateStr) {
    const endTime = new Date(endDateStr).getTime();
    if (!Number.isNaN(endTime) && endTime < Date.now()) return false;
  }
  return true;
};

const Offers: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyActive, setOnlyActive] = useState(false);

  const { data, isLoading, isError, refetch } = useOffers();

  const offers: OfferItem[] = Array.isArray(data) ? data : data?.offers ?? [];

  const filteredOffers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return offers.filter((offer) => {
      if (onlyActive && !isOfferActive(offer)) return false;
      if (!q) return true;
      const title = getOfferTitle(offer).toLowerCase();
      const desc = offer.description?.toLowerCase() ?? '';
      const code = offer.code?.toLowerCase() ?? '';
      return title.includes(q) || desc.includes(q) || code.includes(q);
    });
  }, [offers, searchQuery, onlyActive]);

  const handleOpenOffer = (offer: OfferItem) => {
    navigate(`/offers/${offer.id}`, { state: { offer } });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-surface text-gray-800">
      <main className="max-w-6xl mx-auto px-4 md:px-10 py-8 pb-14 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              العروض والخصومات
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              اكتشف أحدث العروض وتصفح المتاجر المشاركة في كل عرض
            </p>
          </div>

          {!isLoading && !isError && (
            <span className="px-3.5 py-1.5 rounded-full bg-surface-muted text-xs font-semibold text-gray-700">
              {filteredOffers.length} عرض
            </span>
          )}
        </div>

        {/* شريط البحث والفلترة */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن عرض أو كود خصم..."
              className="w-full pr-10 pl-4 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyActive((prev) => !prev)}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold inline-flex items-center gap-2 border transition-colors cursor-pointer self-start sm:self-auto ${
              onlyActive
                ? 'bg-brand text-white border-brand shadow-xs'
                : 'bg-surface text-gray-700 border-gray-300 hover:border-brand'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>العروض السارية فقط</span>
          </button>
        </div>

        {/* حالة التحميل */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200 overflow-hidden bg-surface animate-pulse"
              >
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-2.5">
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* حالة الخطأ */}
        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-700">
              تعذر تحميل قائمة العروض حالياً
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
        {!isLoading && !isError && filteredOffers.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-surface-muted/50 p-10 text-center space-y-2">
            <Tag className="w-9 h-9 text-brand mx-auto" />
            <p className="text-sm font-bold text-gray-800">
              لا توجد عروض مطابقة لبحثك
            </p>
            <p className="text-xs text-gray-500">
              جرّب تعديل كلمة البحث أو إلغاء تصفية العروض السارية.
            </p>
          </div>
        )}

        {/* شبكة العروض */}
        {!isLoading && !isError && filteredOffers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOffers.map((offer) => {
              const title = getOfferTitle(offer);
              const discountLabel = formatOfferDiscount(offer);
              const active = isOfferActive(offer);
              const rawImg = offer.image || offer.cover_image;
              const imgSrc = isValidImageUrl(rawImg)
                ? rawImg!
                : fallbackOfferImage;
              const shopsCount =
                offer._count?.shops ?? offer.shops?.length ?? null;
              const formattedEndDate = formatDateAr(
                offer.end_date ?? offer.expires_at
              );

              return (
                <article
                  key={offer.id}
                  onClick={() => handleOpenOffer(offer)}
                  className="group bg-surface border border-gray-200 hover:border-brand rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col cursor-pointer"
                >
                  <div className="relative h-40 bg-brand-soft overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={title}
                      onError={(e) => {
                        e.currentTarget.src = fallbackOfferImage;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {discountLabel && (
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-brand text-white text-xs font-bold shadow-xs inline-flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          <span>{discountLabel}</span>
                        </span>
                      </div>
                    )}

                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        active
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-gray-800/80 text-gray-200'
                      }`}
                    >
                      {active ? 'ساري' : 'منتهٍ'}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-gray-900 group-hover:text-brand transition-colors truncate">
                          {title}
                        </h2>
                        <ArrowUpLeft className="w-4 h-4 text-gray-400 group-hover:text-brand shrink-0 transition-colors" />
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 min-h-[2rem]">
                        {offer.description ||
                          'عرض مميز متوفر لدى المتاجر المشاركة'}
                      </p>

                      {offer.code && (
                        <div className="pt-1">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-surface-muted border border-dashed border-gray-300 text-[11px] font-mono font-semibold text-gray-800">
                            {offer.code}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-brand" />
                        <span>
                          {shopsCount !== null
                            ? `${shopsCount} متجر مشارك`
                            : 'عرض المتاجر'}
                        </span>
                      </span>

                      {formattedEndDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-brand" />
                          <span>حتى {formattedEndDate}</span>
                        </span>
                      )}
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

export default Offers;