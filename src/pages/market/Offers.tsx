import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Percent,
  Trash2,
  Pencil,
  RotateCcw,
  RefreshCw,
  Search,
  Check,
} from 'lucide-react';
import {
  useCreateOffer,
  useDeleteOffer,
  useOffersList,
  useUpdateOffer,
  useUpdateOfferStatus,
} from '../../hooks/market/useOffers';
import { useProducts } from '../../hooks/market/useProducts';
import {
  resolveOfferImage,
  type ApiDiscountType,
  type OfferApi,
} from '../../services/market/offersService';

const toDateInputValue = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toISOString().slice(0, 10);
};

const formatDisplayDate = (iso?: string): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const statusBadgeStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  EXPIRED: 'bg-amber-50 text-amber-700 border-amber-200',
  INACTIVE: 'bg-gray-100 text-gray-700 border-gray-200',
  DRAFT: 'bg-blue-50 text-blue-700 border-blue-200',
};

const statusLabelMap: Record<string, string> = {
  ACTIVE: 'نشط',
  EXPIRED: 'منتهي',
  INACTIVE: 'متوقف',
  DRAFT: 'مسودة',
};

const MarketOffers: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, error } = useOffersList({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  // جلب منتجات المتجر الفعلية
  const [productSearch, setProductSearch] = useState<string>('');
  const { data: productsRes, isLoading: isLoadingProducts } = useProducts({
    page: 1,
    limit: 100,
    search: productSearch || undefined,
  });

  const shopProducts = productsRes?.data ?? [];

  const createOfferMutation = useCreateOffer();
  const updateOfferMutation = useUpdateOffer();
  const deleteOfferMutation = useDeleteOffer();
  const updateStatusMutation = useUpdateOfferStatus();

  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [discountType, setDiscountType] = useState<ApiDiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('15');
  const [startDate, setStartDate] = useState('2026-11-24');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const offers = data?.data ?? [];
  const meta = data?.meta;

  const selectedSet = useMemo(
    () => new Set(selectedProductIds),
    [selectedProductIds]
  );

  const toggleProductSelection = (productId: string) => {
    const idStr = String(productId);
    setSelectedProductIds((prev) =>
      prev.includes(idStr)
        ? prev.filter((item) => item !== idStr)
        : [...prev, idStr]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = shopProducts.map((p) => String(p.id));
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));

    if (allSelected) {
      setSelectedProductIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const resetForm = () => {
    setEditingOfferId(null);
    setTitle('');
    setDescription('');
    setImage('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('15');
    setStartDate('2026-11-24');
    setEndDate('2026-12-31');
    setSelectedProductIds([]);
    setProductSearch('');
  };

  const handleStartEdit = (offer: OfferApi) => {
    const rawType = (offer.discount_type ?? offer.discountType ?? 'PERCENTAGE')
      .toString()
      .toUpperCase();
    const rawValue = offer.discount_value ?? offer.discountValue ?? '';
    const linkedIds =
      offer.offerProducts
        ?.map((item) => item.product?.id)
        .filter((id): id is string => Boolean(id))
        .map(String) ?? [];

    setEditingOfferId(String(offer.id));
    setTitle(offer.title || '');
    setDescription(offer.description || '');
    setImage(offer.image || '');
    setDiscountType(rawType === 'FIXED' ? 'FIXED' : 'PERCENTAGE');
    setDiscountValue(String(rawValue));
    setStartDate(toDateInputValue(offer.start_at ?? offer.startAt));
    setEndDate(toDateInputValue(offer.end_at ?? offer.endAt));
    setSelectedProductIds(linkedIds);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('يرجى إدخال اسم العرض');
      return;
    }

    const numericValue = Number(discountValue);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      toast.error('يرجى إدخال قيمة خصم صحيحة أكبر من صفر');
      return;
    }

    const startIso = startDate
      ? new Date(`${startDate}T00:00:00.000Z`).toISOString()
      : new Date().toISOString();
    const endIso = endDate
      ? new Date(`${endDate}T23:59:59.999Z`).toISOString()
      : new Date().toISOString();

    try {
      if (editingOfferId) {
        await updateOfferMutation.mutateAsync({
          offerId: editingOfferId,
          payload: {
            title: title.trim(),
            description: description.trim() || undefined,
            image: image.trim() || undefined,
            discountType,
            discountValue: numericValue,
            startAt: startIso,
            endAt: endIso,
            productIds: selectedProductIds,
          },
        });
        toast.success('تم تحديث العرض بنجاح');
      } else {
        await createOfferMutation.mutateAsync({
          title: title.trim(),
          description: description.trim() || undefined,
          image: image.trim() || undefined,
          discountType,
          discountValue: numericValue,
          startAt: startIso,
          endAt: endIso,
          productIds: selectedProductIds,
        });
        toast.success('تم إنشاء العرض بنجاح');
      }

      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل حفظ العرض');
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      await deleteOfferMutation.mutateAsync(offerId);
      if (editingOfferId === offerId) {
        resetForm();
      }
      toast.success('تم حذف العرض بنجاح');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل حذف العرض');
    }
  };

  const handleToggleStatus = async (offer: OfferApi) => {
    const current = (
      offer.effective_status ||
      offer.configured_status ||
      offer.status ||
      'INACTIVE'
    ).toUpperCase();
    const nextStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await updateStatusMutation.mutateAsync({
        offerId: String(offer.id),
        status: nextStatus,
      });
      toast.success(
        `تم تغيير حالة العرض إلى "${statusLabelMap[nextStatus] ?? nextStatus}"`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'فشل تحديث حالة العرض'
      );
    }
  };

  const isSubmitting =
    createOfferMutation.isPending || updateOfferMutation.isPending;

  const allVisibleSelected =
    shopProducts.length > 0 &&
    shopProducts.every((p) => selectedSet.has(String(p.id)));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">العروض</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            الرئيسية &lt; العروض
          </p>
        </div>

        {/* فلتر حالة العرض */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { value: '', label: 'الكل' },
            { value: 'ACTIVE', label: 'نشط' },
            { value: 'EXPIRED', label: 'منتهي' },
            { value: 'INACTIVE', label: 'متوقف' },
          ].map((opt) => (
            <button
              key={opt.value || 'ALL'}
              type="button"
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${statusFilter === opt.value
                  ? 'bg-brand text-white'
                  : 'bg-brand-soft text-brand hover:bg-brand/20'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-xs md:text-sm">
          {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* نموذج إنشاء / تعديل عرض */}
        <form
          onSubmit={handleSaveOffer}
          className="xl:col-span-7 bg-surface border border-gray-200 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              {editingOfferId ? `تعديل العرض #${editingOfferId}` : 'عرض جديد'}
            </h2>
            {editingOfferId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إلغاء التعديل</span>
              </button>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              اسم العرض *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال : Winter Edit"
              className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              وصف العرض
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر للعرض..."
              className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800">
              نوع العرض
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { code: 'PERCENTAGE', label: 'نسبة مئوية (%)' },
                  { code: 'FIXED', label: 'قيمة ثابتة' },
                ] as const
              ).map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setDiscountType(item.code)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer ${discountType === item.code
                      ? 'border-brand bg-brand-soft/40 text-brand'
                      : 'border-gray-300 text-gray-700'
                    }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border ${discountType === item.code
                        ? 'bg-brand border-brand'
                        : 'border-gray-400'
                      }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                قيمة الخصم *
              </label>
              <input
                type="number"
                step="any"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                صورة العرض (مسار أو رابط)
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/uploads/winter-edit.jpg"
                dir="ltr"
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-right focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                تاريخ البدء
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-800">
                تاريخ الانتهاء
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* اختيار المنتجات الفعلية من المتجر */}
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-bold text-gray-800">
                المنتجات المشمولة بالعرض ({selectedProductIds.length} محدد)
              </label>

              {shopProducts.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                >
                  {allVisibleSelected ? 'إلغاء تحديد الظاهر' : 'تحديد الكل'}
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="ابحث عن منتج بالاسم..."
                className="w-full pr-9 pl-3 py-1.5 text-xs bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1.5 bg-surface-muted/30">
              {isLoadingProducts ? (
                <p className="text-xs text-gray-500 py-4 text-center">
                  جاري تحميل المنتجات...
                </p>
              ) : shopProducts.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">
                  لا توجد منتجات متاحة للاختيار.
                </p>
              ) : (
                shopProducts.map((prod) => {
                  const idStr = String(prod.id);
                  const isChecked = selectedSet.has(idStr);
                  const priceNum = Number(prod.price ?? 0);

                  return (
                    <button
                      key={idStr}
                      type="button"
                      onClick={() => toggleProductSelection(idStr)}
                      className={`w-full px-3 py-2 rounded-lg border text-right flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${isChecked
                          ? 'bg-brand-soft/50 border-brand text-gray-900 font-semibold'
                          : 'bg-surface border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked
                              ? 'bg-brand border-brand text-white'
                              : 'border-gray-300 bg-surface'
                            }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </span>
                        <span className="truncate">{prod.name}</span>
                      </div>

                      <span className="text-[11px] text-gray-500 shrink-0">
                        {priceNum.toLocaleString()} ل.س.ج
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            {isSubmitting
              ? 'جاري الحفظ...'
              : editingOfferId
                ? 'تحديث العرض'
                : 'حفظ العرض'}
          </button>
        </form>

        {/* قائمة العروض */}
        <div className="xl:col-span-5 bg-surface border border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              العروض ({meta?.total ?? offers.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-28 rounded-xl border border-gray-200 bg-gray-100/70 animate-pulse"
                />
              ))}
            </div>
          ) : offers.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">
              لا توجد عروض مطابقة للفلتر الحالي.
            </p>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => {
                const rawType = (
                  offer.discount_type ??
                  offer.discountType ??
                  'PERCENTAGE'
                )
                  .toString()
                  .toUpperCase();
                const rawVal = offer.discount_value ?? offer.discountValue ?? 0;
                const valueDisplay =
                  rawType === 'PERCENTAGE'
                    ? `${rawVal}%`
                    : `${Number(rawVal).toLocaleString()} ل.س.ج`;
                const effectiveStatus = (
                  offer.effective_status ||
                  offer.status ||
                  'ACTIVE'
                ).toUpperCase();
                const imgSrc = resolveOfferImage(offer.image);
                const productsList =
                  offer.offerProducts?.map((op) => op.product).filter(Boolean) ??
                  [];

                return (
                  <div
                    key={offer.id}
                    className="p-3.5 rounded-xl border border-gray-200 bg-surface-muted/50 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {imgSrc && (
                          <img
                            crossOrigin="anonymous"
                            src={imgSrc}
                            alt={offer.title}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        )}
                        <div className="space-y-1 text-xs">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Percent className="w-3.5 h-3.5 text-brand" />
                            <span className="font-bold text-gray-900">
                              {offer.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${statusBadgeStyles[effectiveStatus] ??
                                'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                            >
                              {statusLabelMap[effectiveStatus] ?? effectiveStatus}
                            </span>
                          </div>

                          {offer.description && (
                            <p className="text-gray-600">{offer.description}</p>
                          )}

                          <p className="text-gray-700 font-medium">
                            الخصم: {valueDisplay}
                          </p>
                          <p className="text-gray-500">
                            {formatDisplayDate(offer.start_at ?? offer.startAt)} —{' '}
                            {formatDisplayDate(offer.end_at ?? offer.endAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => handleToggleStatus(offer)}
                          title="تبديل حالة العرض"
                          className="p-1.5 rounded-lg border border-gray-200 hover:border-brand text-gray-700 hover:text-brand cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(offer)}
                          title="تعديل العرض"
                          className="p-1.5 rounded-lg border border-gray-200 hover:border-brand text-gray-700 hover:text-brand cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deleteOfferMutation.isPending}
                          onClick={() => handleDeleteOffer(String(offer.id))}
                          title="حذف العرض"
                          className="p-1.5 rounded-lg border border-gray-200 hover:border-rose-300 text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {productsList.length > 0 && (
                      <div className="pt-1 border-t border-gray-200/80 flex flex-wrap gap-1.5">
                        {productsList.map((prod) => (
                          <span
                            key={prod.id}
                            className="px-2 py-0.5 rounded-md bg-surface border border-gray-200 text-[11px] text-gray-700"
                          >
                            {prod.name}
                            {prod.sale_price
                              ? ` (${Number(prod.sale_price).toLocaleString()} ل.س.ج)`
                              : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 cursor-pointer"
                  >
                    السابق
                  </button>
                  <span className="text-gray-600">
                    صفحة {meta.page} من {meta.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 cursor-pointer"
                  >
                    التالي
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketOffers;