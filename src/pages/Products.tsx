import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Heart, ShoppingBag, RotateCcw, Package } from 'lucide-react';
import { useStorefrontContext } from '../layout/MainLayout';
import { useStorefrontCartFav } from '../context/StorefrontCartFavContext';
import {
  useCatalogBrands,
  useCatalogCategories,
  useCatalogProducts,
} from '../hooks/useCatalog';
import {
  resolveHomeMediaUrl,
  type HomeProduct,
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

const StorefrontProducts: React.FC = () => {
  const navigate = useNavigate();
  const outletCtx = useStorefrontContext();
  const {
    favoriteIds: contextFavIds,
    toggleFavoriteProduct,
    addToCart,
  } = useStorefrontCartFav();

  const [localSearch, setLocalSearch] = useState('');
  const [localCategorySlug, setLocalCategorySlug] = useState('');
  const [localSize, setLocalSize] = useState('');
  const [localSort, setLocalSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const searchQuery = outletCtx ? outletCtx.searchQuery : localSearch;
  const setSearchQuery = outletCtx ? outletCtx.setSearchQuery : setLocalSearch;

  const selectedCategorySlug = outletCtx
    ? outletCtx.selectedCategorySlug
    : localCategorySlug;
  const setSelectedCategorySlug = outletCtx
    ? outletCtx.setSelectedCategorySlug
    : setLocalCategorySlug;

  const selectedSize = outletCtx ? outletCtx.selectedSize : localSize;
  const setSelectedSize = outletCtx ? outletCtx.setSelectedSize : setLocalSize;

  const priceSort = outletCtx ? outletCtx.priceSort : localSort;
  const setPriceSort = outletCtx ? outletCtx.setPriceSort : setLocalSort;

  const favoriteIds = contextFavIds;

  const { data: categoriesRes } = useCatalogCategories();
  const { data: brandsRes } = useCatalogBrands();

  const categories = useMemo(() => {
    const apiCats = categoriesRes?.data ?? [];
    if (apiCats.length > 0) return apiCats;
    return outletCtx?.categories ?? [];
  }, [categoriesRes?.data, outletCtx?.categories]);

  useEffect(() => {
    if (outletCtx && categories.length > 0) {
      outletCtx.setCategories(categories);
    }
  }, [outletCtx, categories]);

  const activeCategoryObj = useMemo(
    () =>
      categories.find(
        (c) => c.slug.toLowerCase() === selectedCategorySlug.toLowerCase()
      ),
    [categories, selectedCategorySlug]
  );

  const { data: productsRes, isLoading, error } = useCatalogProducts({
    page,
    limit: 12,
    search: searchQuery.trim() || undefined,
    categoryId: activeCategoryObj?.id || undefined,
    brandId: selectedBrandId || undefined,
    size: selectedSize || undefined,
    sortByPrice: priceSort === 'none' ? undefined : priceSort,
  });

  const rawProducts: HomeProduct[] = productsRes?.data ?? [];

  const filteredProducts = useMemo(() => {
    let list = [...rawProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.brand?.name || '').toLowerCase().includes(q) ||
          (p.shop?.name || '').toLowerCase().includes(q)
      );
    }

    if (selectedCategorySlug) {
      list = list.filter(
        (p) =>
          (p.category?.slug || '').toLowerCase() ===
          selectedCategorySlug.toLowerCase()
      );
    }

    if (selectedBrandId) {
      list = list.filter((p) => String(p.brand?.id ?? '') === selectedBrandId);
    }

    if (selectedSize) {
      list = list.filter((p) =>
        p.variants?.some(
          (v) => (v.size?.name || '').toUpperCase() === selectedSize.toUpperCase()
        )
      );
    }

    if (priceSort !== 'none') {
      list.sort((a, b) => {
        const pa = Number(a.sale_price ?? a.price ?? 0);
        const pb = Number(b.sale_price ?? b.price ?? 0);
        return priceSort === 'asc' ? pa - pb : pb - pa;
      });
    }

    return list;
  }, [
    rawProducts,
    searchQuery,
    selectedCategorySlug,
    selectedBrandId,
    selectedSize,
    priceSort,
  ]);

  const toggleFavorite = (product: HomeProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleFavoriteProduct({
      ...product,
      id: String(product.id),
      name: product.name,
      image: getProductPrimaryImage(product),
    });
    outletCtx?.toggleFavorite?.(String(product.id));
    toast.success(added ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة');
  };

  const handleAddToBag = (product: HomeProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const matchingVariant = selectedSize
      ? product.variants?.find(
          (v) => (v.size?.name || '').toUpperCase() === selectedSize.toUpperCase()
        )
      : product.variants?.[0];

    const resolvedPrice = Number(
      matchingVariant?.sale_price ??
        product.sale_price ??
        matchingVariant?.price ??
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
        colorName: matchingVariant?.color?.name,
        colorHex: matchingVariant?.color?.hex_code,
        sizeName: matchingVariant?.size?.name || selectedSize || 'M',
        price: resolvedPrice,
      }
    );

    outletCtx?.incrementBagCount?.(1);
    toast.success('تمت إضافة المنتج إلى السلة');
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategorySlug('');
    setSelectedBrandId('');
    setSelectedSize('');
    setPriceSort('none');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(selectedCategorySlug) ||
    Boolean(selectedBrandId) ||
    Boolean(selectedSize) ||
    priceSort !== 'none';

  const brands = brandsRes?.data ?? [];

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-6 pt-3 pb-8">
      {/* شريط التصنيفات الدائرية */}
      <section aria-label="التصنيفات" className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-brand" />
            <h1 className="text-base md:text-xl font-bold text-brand-ink">
              كل المنتجات
            </h1>
            <span className="text-xs text-gray-500">
              ({productsRes?.meta?.total ?? filteredProducts.length})
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar py-1.5 px-1">
          <button
            type="button"
            onClick={() => {
              setSelectedCategorySlug('');
              setPage(1);
            }}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div
              className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 ${
                selectedCategorySlug === ''
                  ? 'bg-brand text-surface ring-2 ring-brand ring-offset-2'
                  : 'bg-brand-neutral/70 text-brand-ink'
              }`}
            >
              الكل
            </div>
            <span
              className={`text-[11px] md:text-xs font-medium ${
                selectedCategorySlug === ''
                  ? 'text-brand font-bold'
                  : 'text-brand-charcoal'
              }`}
            >
              جميع الأقسام
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected =
              selectedCategorySlug.toLowerCase() === cat.slug.toLowerCase();
            const imgUrl =
              resolveHomeMediaUrl(cat.image) ||
              categoryFallbackImages[cat.slug.toLowerCase()] ||
              categoryFallbackImages.women;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategorySlug(isSelected ? '' : cat.slug);
                  setPage(1);
                }}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full p-0.5 transition-transform group-hover:scale-105 ${
                    isSelected
                      ? 'ring-2 ring-brand ring-offset-2 bg-brand/10'
                      : 'ring-1 ring-brand-neutral'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={cat.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span
                  className={`text-[11px] md:text-xs font-medium ${
                    isSelected ? 'text-brand font-bold' : 'text-brand-charcoal'
                  }`}
                >
                  {categoryArabicLabels[cat.slug.toLowerCase()] ?? cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* شريط الفلاتر السريعة (الماركة، المقاس، السعر) */}
      <section className="bg-surface border border-brand-neutral/70 rounded-2xl p-3.5 md:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {brands.length > 0 && (
            <select
              value={selectedBrandId}
              onChange={(e) => {
                setSelectedBrandId(e.target.value);
                setPage(1);
              }}
              aria-label="الماركة"
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-surface text-xs font-medium text-brand-ink focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="">كل الماركات</option>
              {brands.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1">
            {['XS', 'S', 'M', 'L', 'XL'].map((sz) => {
              const active = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    setSelectedSize(active ? '' : sz);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-brand text-surface border-brand'
                      : 'border-gray-200 text-gray-700 hover:border-brand'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() =>
              setPriceSort(priceSort === 'asc' ? 'none' : 'asc')
            }
            className={`px-3 py-1.5 rounded-xl border font-medium transition-colors cursor-pointer ${
              priceSort === 'asc'
                ? 'bg-brand text-surface border-brand'
                : 'border-gray-200 text-gray-700 hover:border-brand'
            }`}
          >
            الأرخص أولاً
          </button>
          <button
            type="button"
            onClick={() =>
              setPriceSort(priceSort === 'desc' ? 'none' : 'desc')
            }
            className={`px-3 py-1.5 rounded-xl border font-medium transition-colors cursor-pointer ${
              priceSort === 'desc'
                ? 'bg-brand text-surface border-brand'
                : 'border-gray-200 text-gray-700 hover:border-brand'
            }`}
          >
            الأغلى أولاً
          </button>
        </div>
      </section>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-xs md:text-sm">
          {error instanceof Error ? error.message : 'تعذر تحميل المنتجات'}
        </div>
      )}

      {/* شبكة المنتجات بنفس البطاقات العنابية #642B3D */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 md:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-60 rounded-2xl bg-brand/20 animate-pulse"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-surface border border-brand-neutral/70 rounded-2xl p-10 text-center space-y-3">
          <p className="text-sm font-bold text-brand-ink">
            لا توجد منتجات مطابقة للفلاتر أو البحث الحالي
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-5 py-2 rounded-full bg-brand text-surface text-xs font-semibold hover:bg-brand-dark transition-colors cursor-pointer"
          >
            عرض جميع المنتجات
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 md:gap-5">
          {filteredProducts.map((product) => {
            const idStr = String(product.id);
            const isFav = favoriteIds.includes(idStr);
            const hasSale =
              product.sale_price !== null &&
              product.sale_price !== undefined &&
              Number(product.sale_price) < Number(product.price);
            const displayPrice = product.sale_price ?? product.price ?? '0';

            return (
              <div
                key={idStr}
                onClick={() => navigate(`/products/${idStr}`)}
                className="group relative rounded-2xl bg-brand text-surface p-3.5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  {hasSale ? (
                    <span className="px-2 py-0.5 rounded-full bg-surface text-brand text-[10px] font-bold">
                      تخفيض
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/80 truncate">
                      {product.shop?.name || ''}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(product, e)}
                    aria-label="إضافة للمفضلة"
                    className="w-7 h-7 rounded-lg border border-surface/40 bg-surface/10 hover:bg-surface/20 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFav ? 'fill-surface text-surface' : 'text-surface'
                      }`}
                    />
                  </button>
                </div>

                <div className="my-2 h-28 sm:h-32 md:h-36 flex items-center justify-center overflow-hidden rounded-xl bg-surface/5">
                  <img
                    src={getProductPrimaryImage(product)}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <p className="text-xs md:text-sm font-semibold text-surface truncate">
                    {product.name}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5" dir="ltr">
                      <span className="text-xs md:text-sm font-bold text-surface">
                        {displayPrice}$
                      </span>
                      {hasSale && (
                        <span className="text-[11px] line-through text-white/65">
                          {product.price}$
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddToBag(product, e)}
                      aria-label="إضافة إلى السلة"
                      className="px-2.5 py-1 rounded-full bg-surface/25 hover:bg-surface/35 text-surface text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>أضف</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {productsRes?.meta && productsRes.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2 text-xs">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-1.5 rounded-xl border border-gray-300 disabled:opacity-50 cursor-pointer"
          >
            السابق
          </button>
          <span className="font-semibold text-brand-ink">
            صفحة {productsRes.meta.page} من {productsRes.meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= productsRes.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-1.5 rounded-xl border border-gray-300 disabled:opacity-50 cursor-pointer"
          >
            التالي
          </button>
        </div>
      )}
    </main>
  );
};

export default StorefrontProducts;