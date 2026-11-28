import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Heart,
  ShoppingBag,
  Store,
  MapPin,
  Phone,
  Tag,
  Sparkles,
  ChevronLeft,
  Check,
  Layers,
  Barcode,
  Calendar,
  Minus,
  Plus,
  Share2,
} from 'lucide-react';
import { useStorefrontContext } from '../layout/MainLayout';
import { useStorefrontCartFav } from '../context/StorefrontCartFavContext';
import {
  useProductDetail,
  useRelatedProducts,
} from '../hooks/useProductDetail';
import {
  getUniqueSortedImages,
  resolveProductMediaUrl,
  type ProductVariantItem,
} from '../services/productDetailService';

const fallbackProductImage =
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80';

const colorNameMap: Record<string, string> = {
  black: '#171717',
  navy: '#1e3a5f',
  beige: '#d8c3a5',
  white: '#ffffff',
  red: '#b91c1c',
  burgundy: '#642b3d',
  green: '#15803d',
  gray: '#6b7280',
  grey: '#6b7280',
  brown: '#78350f',
  pink: '#db2777',
};

const getColorSwatch = (name?: string, hex?: string | null): string => {
  if (hex && hex.trim()) return hex.trim();
  if (!name) return '#642B3D';
  return colorNameMap[name.trim().toLowerCase()] || '#642B3D';
};

const formatDate = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const outletCtx = useStorefrontContext();
  const { isFavorite: checkIsFavorite, toggleFavoriteProduct, addToCart } =
    useStorefrontCartFav();

  const { data: productRes, isLoading, error } = useProductDetail(id);
  const { data: relatedRes } = useRelatedProducts(id);

  const product = productRes?.data;
  const relatedProducts = relatedRes?.data ?? [];

  const uniqueImages = useMemo(
    () => getUniqueSortedImages(product?.images),
    [product?.images]
  );

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState<string>('');
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const variants = product?.variants ?? [];

  const uniqueColors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; hex: string }>();
    variants.forEach((v) => {
      if (v.color?.id) {
        map.set(String(v.color.id), {
          id: String(v.color.id),
          name: v.color.name,
          hex: getColorSwatch(v.color.name, v.color.hex_code),
        });
      }
    });
    return Array.from(map.values());
  }, [variants]);

  const uniqueSizes = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; type?: string | null }
    >();
    variants.forEach((v) => {
      if (v.size?.id) {
        map.set(String(v.size.id), {
          id: String(v.size.id),
          name: v.size.name,
          type: v.size.type,
        });
      }
    });
    return Array.from(map.values());
  }, [variants]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedImageIdx(0);
    setQuantity(1);
    if (variants.length > 0) {
      setSelectedColorId(String(variants[0].color?.id ?? ''));
      setSelectedSizeId(String(variants[0].size?.id ?? ''));
    } else {
      setSelectedColorId('');
      setSelectedSizeId('');
    }
  }, [id, variants]);

  const activeVariant: ProductVariantItem | undefined = useMemo(() => {
    if (variants.length === 0) return undefined;
    return (
      variants.find(
        (v) =>
          (!selectedColorId || String(v.color?.id) === selectedColorId) &&
          (!selectedSizeId || String(v.size?.id) === selectedSizeId)
      ) ??
      variants.find((v) => String(v.color?.id) === selectedColorId) ??
      variants.find((v) => String(v.size?.id) === selectedSizeId) ??
      variants[0]
    );
  }, [variants, selectedColorId, selectedSizeId]);

  const handleSelectColor = (colorId: string) => {
    setSelectedColorId(colorId);
    const matchingSize = variants.find(
      (v) =>
        String(v.color?.id) === colorId &&
        String(v.size?.id) === selectedSizeId
    );
    if (!matchingSize) {
      const firstForColor = variants.find(
        (v) => String(v.color?.id) === colorId
      );
      if (firstForColor?.size?.id) {
        setSelectedSizeId(String(firstForColor.size.id));
      }
    }
  };

  const handleSelectSize = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    const matchingColor = variants.find(
      (v) =>
        String(v.size?.id) === sizeId &&
        String(v.color?.id) === selectedColorId
    );
    if (!matchingColor) {
      const firstForSize = variants.find((v) => String(v.size?.id) === sizeId);
      if (firstForSize?.color?.id) {
        setSelectedColorId(String(firstForSize.color.id));
      }
    }
  };

  const isFavorite = id ? checkIsFavorite(String(id)) : false;

  const activeImageUrl =
    resolveProductMediaUrl(uniqueImages[selectedImageIdx]?.image) ||
    fallbackProductImage;

  const handleToggleFavorite = () => {
    if (!product || !id) return;
    const added = toggleFavoriteProduct({
      id: String(product.id ?? id),
      name: product.name,
      image: activeImageUrl,
      price: Number(product.price ?? 0),
      sale_price: product.sale_price,
      shop: product.shop
        ? { id: String(product.shop.id), name: product.shop.name }
        : undefined,
      brand: product.brand
        ? { id: String(product.brand.id), name: product.brand.name }
        : undefined,
    });
    outletCtx?.toggleFavorite?.(String(id));
    toast.success(added ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة');
  };

  const basePrice = Number(activeVariant?.price ?? product?.price ?? 0);
  const salePriceRaw = activeVariant?.sale_price ?? product?.sale_price;
  const salePrice =
    salePriceRaw !== null && salePriceRaw !== undefined
      ? Number(salePriceRaw)
      : null;
  const hasDiscount = salePrice !== null && salePrice < basePrice;

  const handleAddToCart = () => {
    if (!product || !id) return;
    const unitPrice = hasDiscount && salePrice !== null ? salePrice : basePrice;

    addToCart(
      {
        id: String(product.id ?? id),
        name: product.name,
        image: activeImageUrl,
        price: basePrice,
        sale_price: salePrice,
        shop: product.shop
          ? { id: String(product.shop.id), name: product.shop.name }
          : undefined,
      },
      {
        quantity,
        colorName: activeVariant?.color?.name,
        colorHex: activeVariant?.color?.hex_code,
        sizeName: activeVariant?.size?.name || 'M',
        price: unitPrice,
      }
    );

    outletCtx?.incrementBagCount?.(quantity);
    toast.success(`تمت إضافة (${quantity}) قطعة إلى حقيبة التسوق`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ رابط المنتج');
    } catch {
      toast.error('تعذر نسخ الرابط');
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 h-96 rounded-3xl bg-brand/10 animate-pulse" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 w-2/3 rounded-xl bg-brand-neutral/60 animate-pulse" />
            <div className="h-20 w-full rounded-xl bg-brand-neutral/40 animate-pulse" />
            <div className="h-12 w-1/2 rounded-xl bg-brand-neutral/60 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 text-center space-y-4">
        <p className="text-base md:text-lg font-bold text-brand-ink">
          تعذر العثور على تفاصيل هذا المنتج
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand text-surface text-xs md:text-sm font-semibold"
        >
          العودة إلى الرئيسية
        </Link>
      </main>
    );
  }

  const discountPercent = hasDiscount
    ? Math.round(((basePrice - (salePrice ?? basePrice)) / basePrice) * 100)
    : 0;

  const shopLogoUrl = resolveProductMediaUrl(product.shop?.logo);
  const shopCoverUrl = resolveProductMediaUrl(product.shop?.cover_image);

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-5 space-y-10">
      {/* شريط المسار (Breadcrumb) */}
      <nav
        aria-label="مسار التنقل"
        className="flex flex-wrap items-center gap-1.5 text-xs text-brand-charcoal"
      >
        <Link to="/" className="hover:text-brand transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        {product.category && (
          <>
            <Link
              to={`/products?category=${product.category.slug}`}
              className="hover:text-brand transition-colors"
            >
              {product.category.name}
            </Link>
            <ChevronLeft className="w-3.5 h-3.5" />
          </>
        )}
        <span className="font-bold text-brand-ink truncate max-w-[220px]">
          {product.name}
        </span>
      </nav>

      {/* القسم الرئيسي: الصور + كافة تفاصيل المنتج */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 1. معرض الصور */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-surface-muted border border-brand-neutral/70 shadow-sm">
            <img
              crossOrigin="anonymous"
              src={activeImageUrl}
              alt={product.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallbackProductImage;
              }}
              className="w-full h-full object-cover"
            />

            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {hasDiscount && (
                <span className="px-3 py-1 rounded-full bg-brand text-surface text-xs font-bold shadow-md">
                  خصم {discountPercent}%
                </span>
              )}
              {product.status && (
                <span className="px-3 py-1 rounded-full bg-surface/90 text-brand-ink text-[11px] font-semibold shadow-2xs">
                  {product.status === 'ACTIVE' ? 'متوفر' : product.status}
                </span>
              )}
            </div>

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleToggleFavorite}
                aria-label="إضافة للمفضلة"
                className="w-10 h-10 rounded-full bg-surface/90 hover:bg-surface text-brand shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite ? 'fill-brand text-brand' : 'text-brand'
                    }`}
                />
              </button>

              <button
                type="button"
                onClick={handleShare}
                aria-label="مشاركة المنتج"
                className="w-10 h-10 rounded-full bg-surface/90 hover:bg-surface text-brand-charcoal hover:text-brand shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {uniqueImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {uniqueImages.map((img, idx) => {
                const thumbUrl =
                  resolveProductMediaUrl(img.image) || fallbackProductImage;
                const isSelected = idx === selectedImageIdx;

                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-20 h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${isSelected
                      ? 'border-brand ring-2 ring-brand/25 scale-[1.02]'
                      : 'border-brand-neutral/70 opacity-75 hover:opacity-100'
                      }`}
                  >
                    <img
                      crossOrigin="anonymous"
                      src={thumbUrl}
                      alt={`${product.name} ${idx + 1}`}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          fallbackProductImage;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. تفاصيل المنتج والخيارات */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {product.brand && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand text-surface text-xs font-bold tracking-wide">
                <Tag className="w-3.5 h-3.5" />
                <span>{product.brand.name}</span>
              </span>
            )}
            {product.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-muted border border-brand-neutral text-brand-charcoal text-xs font-semibold">
                <Layers className="w-3.5 h-3.5 text-brand" />
                <span>{product.category.name}</span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-brand-ink leading-snug">
              {product.name}
            </h1>
            {product.description && (
              <p className="text-xs sm:text-sm text-brand-charcoal leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-surface-muted border border-brand-neutral/70 flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-3" dir="ltr">
              <span className="text-2xl md:text-3xl font-extrabold text-brand">
                {hasDiscount ? salePrice : basePrice}$
              </span>
              {hasDiscount && (
                <span className="text-base text-brand-charcoal/60 line-through font-semibold">
                  {basePrice}$
                </span>
              )}
            </div>

            {activeVariant?.sku && (
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-mono text-brand-charcoal bg-surface px-2.5 py-1 rounded-lg border border-brand-neutral/70"
                dir="ltr"
              >
                <Barcode className="w-3.5 h-3.5 text-brand" />
                <span>SKU: {activeVariant.sku}</span>
              </span>
            )}
          </div>

          {product.activeOffers && product.activeOffers.length > 0 && (
            <div className="space-y-2">
              {product.activeOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="p-3.5 rounded-2xl bg-gradient-to-l from-brand to-brand-wine text-surface flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
                      <Sparkles className="w-4 h-4" />
                      <span>{offer.title}</span>
                    </div>
                    {offer.description && (
                      <p className="text-xs text-surface/90">
                        {offer.description}
                      </p>
                    )}
                    <p className="text-[11px] text-surface/75 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>ينتهي في {formatDate(offer.end_at)}</span>
                    </p>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl bg-surface text-brand text-xs font-extrabold shrink-0">
                    {offer.discount_type === 'PERCENTAGE'
                      ? `${offer.discount_value}% خصم`
                      : `${offer.discount_value}$ خصم`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {uniqueColors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="font-bold text-brand-ink">اللون المتوفر:</span>
                <span className="text-brand font-semibold">
                  {activeVariant?.color?.name}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {uniqueColors.map((col) => {
                  const selected = selectedColorId === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => handleSelectColor(col.id)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${selected
                        ? 'border-brand bg-brand/5 text-brand ring-2 ring-brand/20'
                        : 'border-brand-neutral bg-surface text-brand-charcoal hover:border-brand/50'
                        }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-brand" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {uniqueSizes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="font-bold text-brand-ink">
                  المقاس{' '}
                  {activeVariant?.size?.type
                    ? `(${activeVariant.size.type})`
                    : ''}
                  :
                </span>
                <span className="text-brand font-semibold">
                  {activeVariant?.size?.name}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {uniqueSizes.map((sz) => {
                  const selected = selectedSizeId === sz.id;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => handleSelectSize(sz.id)}
                      className={`min-w-[48px] px-4 py-2 rounded-xl border text-xs md:text-sm font-bold transition-all cursor-pointer ${selected
                        ? 'bg-brand text-surface border-brand shadow-xs'
                        : 'bg-surface text-brand-ink border-brand-neutral hover:border-brand'
                        }`}
                    >
                      {sz.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {variants.length > 0 && (
            <div className="rounded-2xl border border-brand-neutral/70 overflow-hidden">
              <div className="bg-surface-muted px-4 py-2.5 text-xs font-bold text-brand-ink border-b border-brand-neutral/70">
                جميع الخيارات المتوفرة للمنتج ({variants.length})
              </div>
              <div className="divide-y divide-brand-neutral/50 text-xs">
                {variants.map((v) => {
                  const isCurrent = activeVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        if (v.color?.id) setSelectedColorId(String(v.color.id));
                        if (v.size?.id) setSelectedSizeId(String(v.size.id));
                      }}
                      className={`w-full px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-right transition-colors cursor-pointer ${isCurrent
                        ? 'bg-brand/5'
                        : 'hover:bg-surface-muted/60'
                        }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-brand-ink">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15"
                          style={{
                            backgroundColor: getColorSwatch(
                              v.color?.name,
                              v.color?.hex_code
                            ),
                          }}
                        />
                        <span>{v.color?.name || '-'}</span>
                        <span className="text-brand-charcoal">/</span>
                        <span>مقاس {v.size?.name || '-'}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {v.sku && (
                          <span className="text-[11px] font-mono text-brand-charcoal">
                            {v.sku}
                          </span>
                        )}
                        <span className="font-bold text-brand" dir="ltr">
                          {v.sale_price ?? v.price}$
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center rounded-full border border-brand-neutral bg-surface px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="إنقاص الكمية"
                className="w-8 h-8 rounded-full hover:bg-surface-muted flex items-center justify-center text-brand-ink cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-brand-ink">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="زيادة الكمية"
                className="w-8 h-8 rounded-full hover:bg-surface-muted flex items-center justify-center text-brand-ink cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 min-w-[200px] py-3.5 px-6 rounded-full bg-brand hover:bg-brand-dark text-surface font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>أضف إلى حقيبة التسوق</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. معلومات المتجر والفروع */}
      {product.shop && (
        <section className="rounded-3xl border border-brand-neutral/80 bg-surface-muted/60 overflow-hidden">
          {shopCoverUrl && (
            <div className="h-32 sm:h-40 w-full overflow-hidden bg-brand-dark">
              <img
                crossOrigin="anonymous"
                src={shopCoverUrl}
                alt={product.shop.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
                className="w-full h-full object-cover opacity-85"
              />
            </div>
          )}

          <div className="p-5 md:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {shopLogoUrl ? (
                  <img
                    crossOrigin="anonymous"
                    src={shopLogoUrl}
                    alt={product.shop.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        'none';
                    }}
                    className="w-14 h-14 rounded-2xl object-cover border border-brand-neutral bg-surface"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-brand text-surface flex items-center justify-center">
                    <Store className="w-6 h-6" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base md:text-lg font-bold text-brand-ink">
                      {product.shop.name}
                    </h2>
                    {product.shop.status === 'APPROVED' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                        متجر موثّق
                      </span>
                    )}
                  </div>
                  {product.shop.description && (
                    <p className="text-xs text-brand-charcoal mt-0.5">
                      {product.shop.description}
                    </p>
                  )}
                </div>
              </div>

              <Link
                to={`/shops/${product.shop.id}`}
                className="px-4 py-2 rounded-full bg-brand text-surface hover:bg-brand-dark text-xs font-semibold transition-colors"
              >
                زيارة المتجر
              </Link>
            </div>

            {product.shop.branches && product.shop.branches.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-brand-neutral/70">
                <h3 className="text-xs md:text-sm font-bold text-brand-ink">
                  فروع المتجر ({product.shop.branches.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.shop.branches.map((branch) => {
                    const locationText = [
                      branch.city,
                      branch.area,
                      branch.address,
                    ]
                      .filter(Boolean)
                      .join(' ، ');

                    return (
                      <div
                        key={branch.id}
                        className="p-3.5 rounded-2xl bg-surface border border-brand-neutral/70 flex flex-col justify-between gap-2"
                      >
                        <p className="text-xs md:text-sm font-bold text-brand-ink">
                          {branch.name}
                        </p>
                        {locationText && (
                          <p className="text-xs text-brand-charcoal flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                            <span>{locationText}</span>
                          </p>
                        )}
                        {branch.phone && (
                          <a
                            href={`tel:${branch.phone}`}
                            className="text-xs text-brand font-semibold flex items-center gap-1.5 hover:underline w-fit"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span dir="ltr">{branch.phone}</span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. منتجات ذات صلة */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-xl font-bold text-brand-ink">
              منتجات ذات صلة
            </h2>
            <Link
              to="/products"
              className="text-xs font-semibold text-brand hover:underline"
            >
              عرض الكل
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 md:gap-5">
            {relatedProducts.map((item) => {
              const relImg =
                resolveProductMediaUrl(
                  getUniqueSortedImages(item.images)[0]?.image
                ) || fallbackProductImage;
              const relPrice = item.sale_price ?? item.price ?? '0';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    navigate(`/products/${item.id}`);
                  }}
                  className="group rounded-2xl bg-brand text-surface p-3.5 flex flex-col justify-between text-right shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="h-32 sm:h-36 w-full rounded-xl overflow-hidden bg-surface/5 mb-2.5">
                    <img
                      crossOrigin="anonymous"
                      src={relImg}
                      alt={item.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          fallbackProductImage;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs md:text-sm font-semibold text-surface truncate">
                      {item.name}
                    </p>
                    <p
                      className="text-xs md:text-sm font-bold text-white/95"
                      dir="ltr"
                    >
                      {relPrice}$
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetails;