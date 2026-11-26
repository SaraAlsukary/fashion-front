import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Star,
  Package,
  GitBranch,
  MessageSquare,
  ArrowRight,
  Send,
  RefreshCw,
} from 'lucide-react';
import { shopDetailsService } from '../services/shopDetailsService';

const fallbackCover =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80';

const fallbackLogo =
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=240&q=80';

const fallbackProductImg =
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80';

type ActiveTab = 'branches' | 'products' | 'reviews';

const ShopDetails: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTab>('branches');
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState('');

  const resolvedId = shopId ?? '';

  const shopQuery = useQuery({
    queryKey: ['shops', 'detail', resolvedId],
    queryFn: () => shopDetailsService.getShopById(resolvedId),
    enabled: Boolean(resolvedId),
  });

  const branchesQuery = useQuery({
    queryKey: ['shops', resolvedId, 'branches'],
    queryFn: () => shopDetailsService.getBranches(resolvedId),
    enabled: Boolean(resolvedId),
  });

  const productsQuery = useQuery({
    queryKey: ['shops', resolvedId, 'products'],
    queryFn: () => shopDetailsService.getProducts(resolvedId),
    enabled: Boolean(resolvedId),
  });

  const reviewsQuery = useQuery({
    queryKey: ['shops', resolvedId, 'reviews'],
    queryFn: () => shopDetailsService.getReviews(resolvedId),
    enabled: Boolean(resolvedId),
  });

  const summaryQuery = useQuery({
    queryKey: ['shops', resolvedId, 'reviews', 'summary'],
    queryFn: () => shopDetailsService.getReviewsSummary(resolvedId),
    enabled: Boolean(resolvedId),
  });

  const createReviewMutation = useMutation({
    mutationFn: (payload: { rating: number; comment: string }) =>
      shopDetailsService.createReview(resolvedId, payload),
    onSuccess: () => {
      toast.success('تم إرسال تقييمك بنجاح');
      setCommentInput('');
      setRatingInput(5);
      void queryClient.invalidateQueries({
        queryKey: ['shops', resolvedId, 'reviews'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['shops', resolvedId, 'reviews', 'summary'],
      });
    },
    onError: () => {
      toast.error('تعذر إرسال التقييم، تأكد من تسجيل الدخول وحاول مجدداً');
    },
  });

  const branches = branchesQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];
  const shop = shopQuery.data;

  const averageRating = useMemo(() => {
    if (typeof summaryQuery.data?.averageRating === 'number') {
      return summaryQuery.data.averageRating.toFixed(1);
    }
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [summaryQuery.data, reviews]);

  const totalReviewsCount =
    summaryQuery.data?.totalReviews ?? shop?._count?.reviews ?? reviews.length;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      toast.error('يرجى كتابة تعليق قبل الإرسال');
      return;
    }
    createReviewMutation.mutate({
      rating: ratingInput,
      comment: commentInput.trim(),
    });
  };
useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resolvedId]);
  return (
    <div dir="rtl" className="min-h-screen bg-surface text-gray-800">
      <main className="max-w-6xl mx-auto px-4 md:px-10 py-8 pb-14 space-y-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/shops')}
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-gray-700 hover:text-brand transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى قائمة المتاجر</span>
          </button>
        </div>

        {shopQuery.isLoading && (
          <div className="rounded-2xl border border-gray-200 overflow-hidden bg-surface animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-6 space-y-3">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-80 bg-gray-100 rounded" />
            </div>
          </div>
        )}

        {shopQuery.isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-700">
              تعذر تحميل بيانات المتجر
            </p>
            <button
              type="button"
              onClick={() => void shopQuery.refetch()}
              className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        )}

        {shop && (
          <section className="rounded-2xl border border-gray-200 bg-surface overflow-hidden shadow-2xs">
            <div className="relative h-44 md:h-56 bg-brand-soft">
              <img
                src={shop.cover_image || fallbackCover}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 -mt-14 md:-mt-16 rounded-2xl border-4 border-surface bg-surface shadow-md overflow-hidden shrink-0">
                  <img
                    src={shop.logo || fallbackLogo}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {shop.name}
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 max-w-2xl">
                    {shop.description || 'متجر أزياء ومنتجات متنوعة'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-gray-600">
                    {shop.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-brand" />
                        <span dir="ltr">{shop.phone}</span>
                      </span>
                    )}
                    {shop.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-brand" />
                        <span dir="ltr">{shop.email}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 inline-flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{averageRating}</span>
                  <span className="text-amber-700/80 font-normal">
                    ({totalReviewsCount} تقييم)
                  </span>
                </div>

                <div className="px-3.5 py-2 rounded-xl bg-surface-muted text-gray-800 inline-flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-brand" />
                  <span>{shop._count?.products ?? products.length} منتج</span>
                </div>

                <div className="px-3.5 py-2 rounded-xl bg-surface-muted text-gray-800 inline-flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-brand" />
                  <span>{shop._count?.branches ?? branches.length} فرع</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center gap-2.5 border-b border-gray-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('branches')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'branches'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-surface text-gray-700 border border-gray-300 hover:border-brand'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>الفروع ({branches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-surface text-gray-700 border border-gray-300 hover:border-brand'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-surface text-gray-700 border border-gray-300 hover:border-brand'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>التقييمات ({reviews.length})</span>
          </button>
        </div>

        {activeTab === 'branches' && (
          <section className="space-y-4">
            {branchesQuery.isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-36 rounded-2xl bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : branches.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-surface-muted/50 p-8 text-center text-xs md:text-sm text-gray-500">
                لا توجد فروع متاحة لهذا المتجر حالياً
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="rounded-2xl border border-gray-200 bg-surface p-4 flex flex-col sm:flex-row gap-4 shadow-2xs"
                  >
                    <img
                      src={branch.image || fallbackCover}
                      alt={branch.name}
                      className="w-full sm:w-36 h-32 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 space-y-1.5 text-xs text-gray-700">
                      <h2 className="text-sm md:text-base font-bold text-gray-900">
                        {branch.name}
                      </h2>
                      {(branch.address || branch.city) && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span>
                            {[branch.city, branch.address]
                              .filter(Boolean)
                              .join(' ، ')}
                          </span>
                        </p>
                      )}
                      {branch.working_hours && (
                        <p className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span>{branch.working_hours}</span>
                        </p>
                      )}
                      {branch.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span dir="ltr">{branch.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'products' && (
          <section className="space-y-4">
            {productsQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-surface-muted/50 p-8 text-center text-xs md:text-sm text-gray-500">
                لا توجد منتجات متاحة لهذا المتجر حالياً
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((product) => {
                  const primaryImage =
                    product.images?.find((img) => img.is_primary)?.image ??
                    product.images?.[0]?.image ??
                    fallbackProductImg;

                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="group rounded-2xl border border-gray-200 hover:border-brand bg-surface overflow-hidden shadow-2xs transition-all cursor-pointer flex flex-col"
                    >
                      <div className="h-44 bg-brand-soft/40 overflow-hidden">
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand transition-colors truncate">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {product.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          {product.sale_price ? (
                            <>
                              <span className="text-xs md:text-sm font-bold text-brand">
                                {product.sale_price} ل.س.ج
                              </span>
                              <span className="text-xs text-gray-400 line-through">
                                {product.price} ل.س.ج
                              </span>
                            </>
                          ) : (
                            <span className="text-xs md:text-sm font-bold text-gray-900">
                              {product.price} ل.س.ج
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'reviews' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleReviewSubmit}
              className="lg:col-span-5 rounded-2xl border border-gray-200 bg-surface p-5 space-y-4"
            >
              <h2 className="text-base font-bold text-gray-900">
                أضف تقييمك للمتجر
              </h2>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  التقييم
                </label>
                <div className="flex items-center gap-1.5" dir="ltr">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const active = starValue <= ratingInput;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRatingInput(starValue)}
                        aria-label={`تقييم ${starValue} من 5`}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            active
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  التعليق
                </label>
                <textarea
                  rows={4}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="شارك تجربتك مع المتجر..."
                  className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-xl focus:outline-none focus:border-brand"
                />
              </div>

              <button
                type="submit"
                disabled={createReviewMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>
                  {createReviewMutation.isPending
                    ? 'جارٍ الإرسال...'
                    : 'إرسال التقييم'}
                </span>
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {reviewsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-2xl bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-surface-muted/50 p-8 text-center text-xs md:text-sm text-gray-500">
                  لا توجد تقييمات لهذا المتجر بعد. كن أول من يقيّمه!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-gray-200 bg-surface p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {rev.user?.name || rev.user?.email || 'عميل'}
                      </span>

                      <div className="inline-flex items-center gap-0.5" dir="ltr">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.comment && (
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                        {rev.comment}
                      </p>
                    )}

                    {rev.created_at && (
                      <p className="text-[11px] text-gray-400">
                        {new Date(rev.created_at).toLocaleDateString('ar-SY')}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ShopDetails;