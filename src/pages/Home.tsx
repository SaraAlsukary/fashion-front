import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  LayoutGrid,
} from 'lucide-react';
import { useStorefrontContext } from '../layout/MainLayout';
import { useStorefrontCartFav } from '../context/StorefrontCartFavContext';
import {
  useHomeActiveOffers,
  useHomeFeaturedShops,
  useHomeOverview,
} from '../hooks/useHomeContent';
import { useCategories } from '../hooks/useCategories';
import {
  resolveHomeMediaUrl,
  type HomeCategory,
  type HomeOffer,
  type HomeProduct,
  type HomeShop,
} from '../services/homeService';

const categoryFallbackImages: Record<string, string> = {
  women:
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=240&q=80',
  men:
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=240&q=80',
  dresses:
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=240&q=80',
  bags:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=240&q=80',
  shoes:
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&q=80',
  accessories:
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=240&q=80',
  jackets:
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=240&q=80',
  casual:
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=240&q=80',
  formal:
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=240&q=80',
};

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

const defaultBrands = [
  { id: '1', name: 'ZARA' },
  { id: '2', name: 'CHANEL' },
  { id: '3', name: 'AURELIA' },
  { id: '4', name: 'HORIZON' },
];

const getProductPrimaryImage = (product: HomeProduct): string => {
  const sorted = [...(product.images ?? [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  const raw = sorted[0]?.image;
  return (
    resolveHomeMediaUrl(raw) ||
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=400&q=80'
  );
};

const extractCategoriesList = (raw: unknown): HomeCategory[] => {
  if (Array.isArray(raw)) return raw as HomeCategory[];
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as {
    data?: HomeCategory[] | { categories?: HomeCategory[]; items?: HomeCategory[] };
    categories?: HomeCategory[];
    items?: HomeCategory[];
  };
  if (Array.isArray(obj.data)) return obj.data;
  if (Array.isArray(obj.categories)) return obj.categories;
  if (Array.isArray(obj.items)) return obj.items;
  if (obj.data && typeof obj.data === 'object') {
    const nested = obj.data.categories ?? obj.data.items;
    if (Array.isArray(nested)) return nested;
  }
  return [];
};

const StorefrontHome: React.FC = () => {
  const navigate = useNavigate();
  const outletCtx = useStorefrontContext();
  const { favoriteIds, toggleFavoriteProduct, addToCart } =
    useStorefrontCartFav();

  const { data: homeRes, isLoading } = useHomeOverview();
  const { data: shopsRes } = useHomeFeaturedShops();
  const { data: offersRes } = useHomeActiveOffers();
  const { data: categoriesRes } = useCategories();

  const categoriesScrollRef = useRef<HTMLDivElement | null>(null);

  const [isAutoScrollingCategories, setIsAutoScrollingCategories] =
    useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [localCategory, setLocalCategory] = useState('');
  const [localSize, setLocalSize] = useState('');
  const [localSort, setLocalSort] = useState<'none' | 'asc' | 'desc'>('none');

  const searchQuery = outletCtx ? outletCtx.searchQuery : localSearch;
  const setSearchQuery = outletCtx ? outletCtx.setSearchQuery : setLocalSearch;
  const selectedCategorySlug = outletCtx
    ? outletCtx.selectedCategorySlug
    : localCategory;
  const setSelectedCategorySlug = outletCtx
    ? outletCtx.setSelectedCategorySlug
    : setLocalCategory;
  const selectedSize = outletCtx ? outletCtx.selectedSize : localSize;
  const priceSort = outletCtx ? outletCtx.priceSort : localSort;

  const homeData = homeRes?.data;
  const hookCategories = extractCategoriesList(categoriesRes);
  const categories: HomeCategory[] =
    hookCategories.length > 0 ? hookCategories : homeData?.categories ?? [];
  const featuredProducts: HomeProduct[] = homeData?.featuredProducts ?? [];
  const newArrivals: HomeProduct[] = homeData?.newArrivals ?? [];
  const onSaleProducts: HomeProduct[] = homeData?.onSaleProducts ?? [];
  const featuredShops: HomeShop[] =
    shopsRes?.data ?? homeData?.featuredShops ?? [];
  const activeOffers: HomeOffer[] =
    offersRes?.data ?? homeData?.activeOffers ?? [];

  useEffect(() => {
    if (outletCtx && categories.length > 0) {
      outletCtx.setCategories(categories);
    }
  }, [outletCtx, categories]);

  useEffect(() => {
    const el = categoriesScrollRef.current;
    if (!el || !isAutoScrollingCategories || categories.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      if (!categoriesScrollRef.current) return;
      const container = categoriesScrollRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 4) return;

      const isNegativeRtl = container.scrollLeft < 0;
      const current = Math.abs(container.scrollLeft);

      if (current >= maxScroll - 2) {
        container.scrollLeft = 0;
      } else {
        const next = current + 1;
        container.scrollLeft = isNegativeRtl ? -next : next;
      }
    }, 30);

    return () => window.clearInterval(timer);
  }, [isAutoScrollingCategories, categories.length]);

  const scrollCategories = (direction: 'left' | 'right') => {
    setIsAutoScrollingCategories(false);
    const el = categoriesScrollRef.current;
    if (!el) return;
    const offset = direction === 'right' ? 240 : -240;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleCategoryNavigate = (slugOrId: string) => {
    if (!slugOrId) {
      setSelectedCategorySlug('');
      navigate('/products');
      return;
    }
    setSelectedCategorySlug(slugOrId);
    navigate(`/products?category=${encodeURIComponent(slugOrId)}`);
  };

  const toggleFavorite = (product: HomeProduct, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const idStr = String(product.id);
    const added = toggleFavoriteProduct({
      ...product,
      id: idStr,
      name: product.name,
      image: getProductPrimaryImage(product),
    });
    outletCtx?.toggleFavorite?.(idStr);
    toast.success(added ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة');
  };

  const handleAddToBag = (product: HomeProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const firstVariant = product.variants?.[0];
    const resolvedPrice = Number(
      firstVariant?.sale_price ??
      product.sale_price ??
      firstVariant?.price ??
      product.price ??
      0
    );

    addToCart(
      {
        ...product,
        id: String(product.id),
        name: product.name,
        image: getProductPrimaryImage(product),
      },
      {
        quantity: 1,
        colorName: firstVariant?.color?.name,
        colorHex: firstVariant?.color?.hex_code,
        sizeName: firstVariant?.size?.name || 'M',
        price: resolvedPrice,
      }
    );

    outletCtx?.incrementBagCount?.(1);
    toast.success('تمت إضافة المنتج إلى السلة');
  };

  const applyProductFilters = (list: HomeProduct[]): HomeProduct[] => {
    let result = [...list];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.brand?.name || '').toLowerCase().includes(q)
      );
    }

    if (selectedCategorySlug) {
      result = result.filter(
        (p) =>
          (p.category?.slug || '').toLowerCase() ===
          selectedCategorySlug.toLowerCase() ||
          String(p.category?.id ?? '') === String(selectedCategorySlug)
      );
    }

    if (selectedSize) {
      result = result.filter((p) =>
        p.variants?.some(
          (v) => (v.size?.name || '').toUpperCase() === selectedSize
        )
      );
    }

    if (priceSort !== 'none') {
      result.sort((a, b) => {
        const pa = Number(a.sale_price ?? a.price ?? 0);
        const pb = Number(b.sale_price ?? b.price ?? 0);
        return priceSort === 'asc' ? pa - pb : pb - pa;
      });
    }

    return result;
  };

  const filteredFeatured = useMemo(
    () => applyProductFilters(featuredProducts),
    [
      featuredProducts,
      searchQuery,
      selectedCategorySlug,
      selectedSize,
      priceSort,
    ]
  );

  const filteredNewArrivals = useMemo(
    () => applyProductFilters(newArrivals),
    [
      newArrivals,
      searchQuery,
      selectedCategorySlug,
      selectedSize,
      priceSort,
    ]
  );

  const filteredOnSale = useMemo(
    () => applyProductFilters(onSaleProducts),
    [
      onSaleProducts,
      searchQuery,
      selectedCategorySlug,
      selectedSize,
      priceSort,
    ]
  );

  const brandsList = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    [...featuredProducts, ...newArrivals, ...onSaleProducts].forEach((p) => {
      if (p.brand?.id && p.brand?.name) {
        map.set(String(p.brand.id), {
          id: String(p.brand.id),
          name: p.brand.name.toUpperCase(),
        });
      }
    });
    const extracted = Array.from(map.values());
    return extracted.length > 0 ? extracted : defaultBrands;
  }, [featuredProducts, newArrivals, onSaleProducts]);

  const productsPageLink = selectedCategorySlug
    ? `/products?category=${encodeURIComponent(selectedCategorySlug)}`
    : '/products';

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8 pt-2 pb-6">
      {/* 1. شريط الفئات الدائرية المتحرك والسلس */}
      <section
        aria-label="الفئات"
        onMouseEnter={() => setIsAutoScrollingCategories(false)}
        onMouseLeave={() => setIsAutoScrollingCategories(true)}
        className="pt-1 space-y-2"
      >
        <div className="relative flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollCategories('right')}
            aria-label="تمرير التصنيفات يميناً"
            className="hidden sm:flex w-8 h-8 rounded-full bg-surface border border-brand-neutral/80 shadow-xs hover:border-brand hover:text-brand items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div
            ref={categoriesScrollRef}
            onTouchStart={() => setIsAutoScrollingCategories(false)}
            className="flex-1 flex items-center justify-start gap-3.5 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-1"
          >
            {/* خيار الكل */}
            <button
              type="button"
              onClick={() => handleCategoryNavigate('')}
              className={`flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer transition-all duration-300 ${selectedCategorySlug === ''
                ? '-translate-y-1'
                : 'hover:-translate-y-1'
                }`}
            >
              <div
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full p-0.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md flex items-center justify-center ${selectedCategorySlug === ''
                  ? 'ring-2 ring-brand bg-brand text-surface scale-105 shadow-md'
                  : 'ring-1 ring-brand-neutral bg-surface text-brand-ink'
                  }`}
              >
                <LayoutGrid className="w-6 h-6" />
              </div>
              <span
                className={`text-[11px] md:text-xs font-medium transition-colors duration-200 ${selectedCategorySlug === ''
                  ? 'text-brand font-bold'
                  : 'text-brand-charcoal group-hover:text-brand'
                  }`}
              >
                الكل
              </span>
            </button>

            {categories.map((cat, idx) => {
              const filterKey = cat.slug || String(cat.id);
              const isSelected = selectedCategorySlug === filterKey;
              const imgUrl =
                resolveHomeMediaUrl(cat.image) ||
                categoryFallbackImages[(cat.slug || '').toLowerCase()] ||
                categoryFallbackImages.women;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryNavigate(filterKey)}
                  style={{ transitionDelay: `${Math.min(idx, 6) * 20}ms` }}
                  className={`flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer transition-all duration-300 ${isSelected ? '-translate-y-1' : 'hover:-translate-y-1'
                    }`}
                >
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full p-0.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md ${isSelected
                      ? 'ring-2 ring-brand bg-brand/15 scale-105 shadow-md'
                      : 'ring-1 ring-brand-neutral bg-surface'
                      }`}
                  >
                    <img
                      crossOrigin="anonymous"
                      src={imgUrl}
                      alt={cat.name}
                      className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span
                    className={`text-[11px] md:text-xs font-medium transition-colors duration-200 ${isSelected
                      ? 'text-brand font-bold'
                      : 'text-brand-charcoal group-hover:text-brand'
                      }`}
                  >
                    {categoryArabicLabels[(cat.slug || '').toLowerCase()] ??
                      cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollCategories('left')}
            aria-label="تمرير التصنيفات يساراً"
            className="hidden sm:flex w-8 h-8 rounded-full bg-surface border border-brand-neutral/80 shadow-xs hover:border-brand hover:text-brand items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2. قسم الهبوط */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-brand via-brand-wine to-brand-mauve text-surface p-6 md:p-10 shadow-lg">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface/15 backdrop-blur-xs text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>تشكيلة الموسم الجديد 2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              أناقتك تبدأ من هنا.. اكتشفي أرقى المتاجر والماركات
            </h1>

            <p className="text-xs sm:text-sm text-surface/90 max-w-xl leading-relaxed">
              تسوقي أحدث صيحات الأزياء، الحقائب، الأحذية، والعطور الفاخرة من
              أفضل المتاجر المحلية والعالمية مع عروض حصرية وتوصيل سريع.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#featured-offers"
                className="px-6 py-2.5 rounded-full bg-surface text-brand hover:bg-surface-muted text-xs md:text-sm font-bold inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <span>تسوق الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </a>

              <Link
                to="/shops"
                className="px-5 py-2.5 rounded-full bg-surface/15 hover:bg-surface/25 border border-surface/30 text-surface text-xs md:text-sm font-semibold transition-all"
              >
                استكشف المتاجر
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-xs aspect-[4/3] rounded-2xl overflow-hidden border-2 border-surface/25 shadow-xl bg-brand-dark">
              <img
                crossOrigin="anonymous"
                src={
                  featuredProducts[0]
                    ? getProductPrimaryImage(featuredProducts[0])
                    : 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80'
                }
                alt="تشكيلة مميزة"
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-deep/95 via-brand-deep/60 to-transparent p-4 flex items-end justify-between">
                <div>
                  <p className="text-[11px] text-amber-200 font-semibold">
                    عروض تصل إلى 25%
                  </p>
                  <p className="text-sm font-bold text-surface">
                    {featuredProducts[0]?.name || 'أزياء وعطور مختارة'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-surface/20 text-xs font-bold">
                  {featuredProducts[0]
                    ? `${featuredProducts[0].sale_price ?? featuredProducts[0].price}$`
                    : '50$'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="w-56 h-56 rounded-full bg-surface/10 blur-2xl absolute -left-16 -top-16 pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="w-44 h-44 rounded-full bg-brand-deep/40 blur-xl absolute right-10 -bottom-20 pointer-events-none"
        />
      </section>

      {/* 3. قسم عروض مميزة */}
      <section id="featured-offers" className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-bold text-brand-ink">
            عروض مميزة
          </h2>
          {activeOffers.length > 0 && (
            <span className="text-xs text-brand font-semibold">
              {activeOffers.length} عرض نشط
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-56 rounded-2xl bg-brand/20 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-5">
            {(filteredFeatured.length > 0
              ? filteredFeatured
              : featuredProducts
            )
              .slice(0, 4)
              .map((product) => {
                const idStr = String(product.id);
                const isFav = favoriteIds.includes(idStr);
                const displayPrice =
                  product.sale_price ?? product.price ?? '50';

                return (
                  <div
                    key={idStr}
                    onClick={() => navigate(`/products/${idStr}`)}
                    className="group relative rounded-2xl bg-brand text-surface p-3.5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(product, e)}
                      aria-label="إضافة للمفضلة"
                      className="self-end w-7 h-7 rounded-lg border border-surface/40 bg-surface/10 hover:bg-surface/20 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${isFav ? 'fill-surface text-surface' : 'text-surface'
                          }`}
                      />
                    </button>

                    <div className="my-2 h-28 sm:h-32 md:h-36 flex items-center justify-center overflow-hidden rounded-xl bg-surface/5">
                      <img
                        src={getProductPrimaryImage(product)}
                        alt={product.name}
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="space-y-2 pt-1">
                      <p
                        className="text-xs md:text-sm font-semibold text-surface truncate text-left"
                        dir="ltr"
                      >
                        {product.name}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-xs md:text-sm font-bold text-surface"
                          dir="ltr"
                        >
                          {displayPrice}$
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleAddToBag(product, e)}
                          className="px-3 py-1 rounded-full bg-surface/25 hover:bg-surface/35 text-surface text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          رؤية المزيد
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        <div className="w-24 h-1 rounded-full bg-brand-ink mx-auto mt-2" />
      </section>

      {/* 4. قسم متاجر مميزة */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-bold text-brand-ink">
            متاجر مميزة
          </h2>
          <Link
            to="/shops"
            className="text-xs font-semibold text-brand hover:underline"
          >
            عرض الكل
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {(featuredShops.length > 0
            ? featuredShops
            : [
              { id: '1', name: 'Atelier North' },
              { id: '2', name: 'Veloura House' },
              { id: '3', name: 'سبور شيك' },
              { id: '4', name: 'ZARA Store' },
            ]
          )
            .slice(0, 4)
            .map((shop) => {
              const logoUrl = resolveHomeMediaUrl(shop.logo);
              return (
                <Link
                  key={shop.id}
                  to={`/shops/${shop.id}`}
                  className="h-28 md:h-32 rounded-xl bg-brand-neutral/80 hover:bg-brand-neutral border border-brand-neutral/70 flex flex-col items-center justify-center gap-2 p-3 text-center transition-colors"
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={shop.name}
                      className="w-12 h-12 rounded-full object-cover border border-surface shadow-2xs"
                    />
                  ) : null}
                  <span className="text-xs md:text-sm font-bold text-brand-ink">
                    {shop.name || 'شعار المتجر'}
                  </span>
                </Link>
              );
            })}
        </div>
      </section>

      {/* أقسام المنتجات */}
      <div id="products-showcase" className="scroll-mt-6 space-y-8">
        <ProductCarouselSection
          title="منتجات جديدة"
          products={filteredNewArrivals}
          moreHref={productsPageLink}
          onSelectProduct={(id) => navigate(`/products/${id}`)}
        />

        <ProductCarouselSection
          title="منتجات الأكثر مشاهدة 🔥"
          products={filteredFeatured}
          moreHref={productsPageLink}
          onSelectProduct={(id) => navigate(`/products/${id}`)}
        />

        <ProductCarouselSection
          title="المنتجات المخفضة"
          products={filteredOnSale}
          moreHref={productsPageLink}
          showDiscountBadge
          onSelectProduct={(id) => navigate(`/products/${id}`)}
        />
      </div>

      {/* 8. قسم الماركات */}
      <section className="space-y-3 pb-4">
        <h2 className="text-base md:text-lg font-bold text-brand-ink">
          الماركات
        </h2>

        <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-2xl mx-auto">
          {brandsList.slice(0, 4).map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => setSearchQuery(brand.name)}
              className="aspect-square rounded-full bg-surface border border-brand-neutral/60 shadow-md hover:shadow-lg hover:border-brand/40 flex items-center justify-center p-2 transition-all cursor-pointer"
            >
              <span className="font-serif text-sm sm:text-lg md:text-xl font-bold tracking-tighter text-brand-ink">
                {brand.name}
              </span>
            </button>
          ))}
        </div>

        <div className="w-24 h-1 rounded-full bg-brand-ink mx-auto pt-0.5" />
      </section>
    </main>
  );
};

interface ProductCarouselSectionProps {
  title: string;
  products: HomeProduct[];
  moreHref: string;
  showDiscountBadge?: boolean;
  onSelectProduct: (id: string) => void;
}

const ProductCarouselSection: React.FC<ProductCarouselSectionProps> = ({
  title,
  products,
  moreHref,
  showDiscountBadge = false,
  onSelectProduct,
}) => {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base md:text-lg font-bold text-brand-ink">
          {title}
        </h2>
        <Link
          to={moreHref}
          aria-label={`المزيد من ${title}`}
          className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-brand hover:underline transition-colors"
        >
          <span>المزيد</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-4">
        {products.slice(0, 5).map((item) => {
          const img = getProductPrimaryImage(item);
          const hasSale =
            item.sale_price !== null &&
            item.sale_price !== undefined &&
            Number(item.sale_price) < Number(item.price);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectProduct(String(item.id))}
              className="group relative aspect-square rounded-2xl bg-brand overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer text-right"
            >
              <img
                src={img}
                crossOrigin="anonymous"
                alt={item.name}
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              />

              {showDiscountBadge && hasSale && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-surface/90 text-brand text-[10px] font-bold">
                  تخفيض
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-shadow/90 via-brand-shadow/50 to-transparent p-2">
                <p className="text-[11px] sm:text-xs font-semibold text-surface truncate">
                  {item.name}
                </p>
                <p
                  className="text-[10px] sm:text-xs text-surface/90 font-bold"
                  dir="ltr"
                >
                  {item.sale_price ?? item.price}$
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="w-24 h-1 rounded-full bg-brand-ink mx-auto" />
    </section>
  );
};

export default StorefrontHome;