import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BadgeCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { ShopServiceProvider, useService } from '../../hooks/admin/useShop';
import { type ShopEntity } from '../../services/admin/shopService';

export type MarketStatus = 'قيد الانتظار' | 'موافق عليها' | 'مرفوضة' | 'معلق';
export type MarketFilterTab = 'ALL' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'SUSPENDED';

export interface AdminMarketRow {
  id: string;
  ownerId: string;
  name: string;
  email: string;
  phone: string | null;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappUrl: string | null;
  statusRaw: string;
  statusLabel: MarketStatus;
  isVerified: boolean;
  rejectionReason: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  ownerName: string;
  ownerEmail: string;
  productsCount: number;
  branchesCount: number;
}

const statusBadgeClasses: Record<MarketStatus, string> = {
  'قيد الانتظار': 'bg-amber-100/90 text-amber-700',
  'موافق عليها': 'bg-emerald-100/90 text-emerald-700',
  مرفوضة: 'bg-rose-100/90 text-rose-600',
  معلق: 'bg-slate-200 text-slate-700',
};

const filterTabs: { key: MarketFilterTab; label: string }[] = [
  { key: 'ALL', label: 'كل المتاجر' },
  { key: 'APPROVED', label: 'المتاجر المقبولة' },
  { key: 'REJECTED', label: 'المتاجر المرفوضة' },
  { key: 'PENDING', label: 'المتاجر قيد الانتظار' },
  { key: 'SUSPENDED', label: 'المتاجر المعلقة' },
];

function mapShopStatus(raw: string): MarketStatus {
  const s = raw.trim().toUpperCase();
  if (s === 'APPROVED') return 'موافق عليها';
  if (s === 'REJECTED') return 'مرفوضة';
  if (s === 'SUSPENDED') return 'معلق';
  return 'قيد الانتظار';
}

function formatDate(raw: string | null | undefined): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function toMarketRow(shop: ShopEntity): AdminMarketRow {
  return {
    id: shop.id,
    ownerId: shop.ownerId,
    name: shop.name,
    email: shop.email || shop.owner?.email || '—',
    phone: shop.phone,
    description: shop.description,
    logo: shop.logo,
    coverImage: shop.coverImage,
    facebookUrl: shop.facebookUrl,
    instagramUrl: shop.instagramUrl,
    whatsappUrl: shop.whatsappUrl,
    statusRaw: shop.status,
    statusLabel: mapShopStatus(shop.status),
    isVerified: shop.isVerified,
    rejectionReason: shop.rejectionReason,
    approvedAt: formatDate(shop.approvedAt),
    createdAt: formatDate(shop.createdAt),
    updatedAt: formatDate(shop.updatedAt),
    ownerName: shop.owner?.name || '—',
    ownerEmail: shop.owner?.email || '—',
    productsCount: shop.counts?.products ?? 0,
    branchesCount: shop.counts?.branches ?? 0,
  };
}

interface MarketsContentProps {
  searchQuery?: string;
  onReviewsClick?: () => void;
}

const MarketsContent: React.FC<MarketsContentProps> = ({
  searchQuery = '',
  onReviewsClick,
}) => {
  const {
    shops,
    page,
    total,
    totalPages,
    statusFilter,
    loading,
    mutating,
    error,
    setPage,
    setStatusFilter,
    setSearch,
    refetch,
    fetchShopDetails,
    updateShop,
    approveShop,
    rejectShop,
    suspendShop,
    activateShop,
    verifyShop,
    unverifyShop,
  } = useService();

  const [viewingMarket, setViewingMarket] = useState<AdminMarketRow | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [editingMarket, setEditingMarket] = useState<AdminMarketRow | null>(null);
  const [rejectingMarket, setRejectingMarket] = useState<AdminMarketRow | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('بيانات غير مكتملة');

  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setSearch(searchQuery);
    setPage(1);
  }, [searchQuery, setSearch, setPage]);

  const rows = useMemo<AdminMarketRow[]>(() => shops.map(toMarketRow), [shops]);

  const pages = useMemo(() => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const set = new Set<number>([1, page, Math.min(totalPages, page + 1), totalPages]);
    return Array.from(set)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }, [totalPages, page]);

  const syncViewingIfOpen = async (shopId: string) => {
    if (viewingMarket?.id !== shopId) return;
    try {
      const fresh = await fetchShopDetails(shopId);
      setViewingMarket(toMarketRow(fresh));
    } catch {
      // الإبقاء على النسخة الحالية
    }
  };

  const handleOpenView = async (row: AdminMarketRow) => {
    setViewingMarket(row);
    setLoadingDetails(true);
    try {
      const fresh = await fetchShopDetails(row.id);
      setViewingMarket(toMarketRow(fresh));
    } catch {
      // الإبقاء على بيانات الصف الحالية
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenEdit = (row: AdminMarketRow) => {
    setEditingMarket(row);
    setEditName(row.name);
    setEditEmail(row.email === '—' ? '' : row.email);
    setEditPhone(row.phone ?? '');
    setEditDescription(row.description ?? '');
    setFeedback(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMarket) return;
    try {
      await updateShop(editingMarket.id, {
        name: editName.trim() || editingMarket.name,
        email: editEmail.trim() ? editEmail.trim() : null,
        phone: editPhone.trim() ? editPhone.trim() : null,
        description: editDescription.trim() ? editDescription.trim() : null,
      });
      setFeedback(`تم تحديث بيانات المتجر ${editingMarket.name}`);
      await syncViewingIfOpen(editingMarket.id);
      setEditingMarket(null);
    } catch {
      // معروض عبر hook
    }
  };

  const handleApprove = async (row: AdminMarketRow) => {
    try {
      await approveShop(row.id);
      setFeedback(`تم قبول المتجر ${row.name}`);
      await syncViewingIfOpen(row.id);
    } catch {
      // معروض عبر hook
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingMarket) return;
    try {
      await rejectShop(rejectingMarket.id, rejectionReason.trim() || 'مرفوض');
      setFeedback(`تم رفض المتجر ${rejectingMarket.name}`);
      await syncViewingIfOpen(rejectingMarket.id);
      setRejectingMarket(null);
    } catch {
      // معروض عبر hook
    }
  };

  const handleSuspend = async (row: AdminMarketRow) => {
    try {
      await suspendShop(row.id);
      setFeedback(`تم تعليق المتجر ${row.name}`);
      await syncViewingIfOpen(row.id);
    } catch {
      // معروض عبر hook
    }
  };

  const handleActivate = async (row: AdminMarketRow) => {
    try {
      await activateShop(row.id);
      setFeedback(`تم تفعيل المتجر ${row.name}`);
      await syncViewingIfOpen(row.id);
    } catch {
      // معروض عبر hook
    }
  };

  const handleToggleVerify = async (row: AdminMarketRow) => {
    try {
      if (row.isVerified) {
        await unverifyShop(row.id);
        setFeedback(`تم إزالة التوثيق عن المتجر ${row.name}`);
      } else {
        await verifyShop(row.id);
        setFeedback(`تم توثيق المتجر ${row.name}`);
      }
      await syncViewingIfOpen(row.id);
    } catch {
      // معروض عبر hook
    }
  };

  const renderActionButtons = (market: AdminMarketRow, insideModal = false) => {
    const statusUpper = market.statusRaw.toUpperCase();
    return (
      <div className="inline-flex items-center justify-center gap-1.5 flex-wrap">
        {statusUpper === 'PENDING' && (
          <>
            <button
              type="button"
              disabled={mutating}
              onClick={() => {
                setRejectingMarket(market);
                setRejectionReason(market.rejectionReason || 'بيانات غير مكتملة');
              }}
              className="px-3 py-1 rounded-md bg-rose-200/90 hover:bg-rose-300 text-rose-700 text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
            >
              رفض
            </button>
            <button
              type="button"
              disabled={mutating}
              onClick={() => void handleApprove(market)}
              className="px-3 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
            >
              قبول
            </button>
          </>
        )}

        {statusUpper === 'APPROVED' && (
          <button
            type="button"
            disabled={mutating}
            onClick={() => void handleSuspend(market)}
            className="px-3 py-1 rounded-md bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
          >
            تعليق
          </button>
        )}

        {(statusUpper === 'SUSPENDED' || statusUpper === 'REJECTED') && (
          <button
            type="button"
            disabled={mutating}
            onClick={() => void handleActivate(market)}
            className="px-3 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
          >
            تفعيل
          </button>
        )}

        <button
          type="button"
          disabled={mutating}
          onClick={() => void handleToggleVerify(market)}
          className={`px-2.5 py-1 rounded-md text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer ${
            market.isVerified
              ? 'bg-sky-100 text-sky-800 hover:bg-sky-200'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {market.isVerified ? 'إلغاء التوثيق' : 'توثيق'}
        </button>

        <button
          type="button"
          disabled={mutating}
          onClick={() => handleOpenEdit(market)}
          className="px-3 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
        >
          تعديل
        </button>

        {!insideModal && (
          <button
            type="button"
            disabled={mutating}
            onClick={() => void handleOpenView(market)}
            className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer"
          >
            عرض
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* العنوان والمسار وزر مراجعات المتاجر */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">ادارة المتاجر</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">الرئيسية &lt; المتاجر</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading || mutating}
            onClick={() => void refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 bg-surface text-xs font-medium text-gray-700 hover:border-brand hover:text-brand disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            onClick={onReviewsClick}
            className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            مراجعااات المتاجر
          </button>
        </div>
      </div>

      {/* أزرار التصفية حسب الحالة */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {filterTabs.map((tab) => {
          const isSelected = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium border transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-brand text-white border-brand shadow-xs'
                  : 'bg-surface text-gray-700 border-gray-300 hover:border-brand hover:text-brand'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs md:text-sm text-emerald-800">
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs md:text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* جدول المتاجر */}
      <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-gray-200/85 text-gray-800 text-xs md:text-sm font-semibold">
                <th className="py-3 px-4">العمليات</th>
                <th className="py-3 px-4">تاريخ الانشاء</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">البريد الالكتروني</th>
                <th className="py-3 px-4">اسم المتجر</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/80 text-xs md:text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-sm text-gray-500">
                    جارٍ تحميل المتاجر...
                  </td>
                </tr>
              ) : (
                rows.map((market) => (
                  <tr
                    key={market.id}
                    className="hover:bg-surface/80 transition-colors"
                  >
                    <td className="py-3 px-4">{renderActionButtons(market)}</td>

                    <td className="py-3 px-4 font-medium text-gray-700">
                      {market.createdAt}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block min-w-[78px] px-3 py-1 rounded-md text-xs font-semibold ${
                          statusBadgeClasses[market.statusLabel]
                        }`}
                      >
                        {market.statusLabel}
                      </span>
                    </td>

                    <td
                      className="py-3 px-4 font-medium text-gray-700"
                      dir="ltr"
                    >
                      {market.email}
                    </td>

                    <td className="py-3 px-4">
                      <div className="inline-flex items-center justify-center gap-2 text-gray-800 font-medium">
                        <span>{market.name}</span>
                        {market.isVerified && (
                          <BadgeCheck className="w-4 h-4 text-sky-600 shrink-0" />
                        )}
                        <span className="w-5 h-5 rounded-full border border-gray-500 inline-flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-gray-600" />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-sm text-gray-500">
                    لا توجد متاجر مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* شريط الترقيم السفلي */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs md:text-sm text-gray-700">
        <div className="flex items-center gap-1.5" dir="ltr">
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            aria-label="الصفحة التالية"
            className="w-8 h-8 rounded-md border border-gray-300 bg-surface flex items-center justify-center hover:border-brand hover:text-brand disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {pages.map((p) => {
            const isCurrent = page === p;
            return (
              <button
                key={p}
                type="button"
                disabled={loading}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-brand text-white border-brand'
                    : 'bg-surface text-gray-800 border-gray-300 hover:border-brand'
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage(Math.max(1, page - 1))}
            aria-label="الصفحة السابقة"
            className="w-8 h-8 rounded-md border border-gray-300 bg-surface flex items-center justify-center hover:border-brand hover:text-brand disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="text-gray-700 font-medium">
          عرض {rows.length} من {total || rows.length}
        </div>
      </div>

      {/* نافذة معاينة المتجر الكاملة */}
      {viewingMarket && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl border border-gray-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  تفاصيل المتجر: {viewingMarket.name}
                </h2>
                {viewingMarket.isVerified && (
                  <BadgeCheck className="w-4 h-4 text-sky-600 shrink-0" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setViewingMarket(null)}
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails && (
              <p className="text-xs text-gray-500">جارٍ تحديث أحدث بيانات المتجر...</p>
            )}

            {/* صور الغلاف والشعار */}
            {(viewingMarket.coverImage || viewingMarket.logo) && (
              <div className="space-y-2">
                {viewingMarket.coverImage && (
                  <img
                    src={viewingMarket.coverImage}
                    alt={`غلاف ${viewingMarket.name}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200 bg-gray-100"
                  />
                )}
                <div className="flex items-center gap-3">
                  {viewingMarket.logo && (
                    <img
                      src={viewingMarket.logo}
                      alt={`شعار ${viewingMarket.name}`}
                      className="w-14 h-14 object-cover rounded-full border border-gray-200 bg-gray-100 shrink-0"
                    />
                  )}
                  <div className="text-xs text-gray-600">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md font-semibold ${
                        statusBadgeClasses[viewingMarket.statusLabel]
                      }`}
                    >
                      {viewingMarket.statusLabel}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* سبب الرفض إن وجد */}
            {viewingMarket.rejectionReason && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                <span className="font-semibold">سبب الرفض: </span>
                <span>{viewingMarket.rejectionReason}</span>
              </div>
            )}

            {/* البيانات الأساسية */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs md:text-sm text-gray-700">
              <p>
                <span className="font-semibold">المعرف:</span> {viewingMarket.id}
              </p>
              <p>
                <span className="font-semibold">المالك:</span> {viewingMarket.ownerName}
                {viewingMarket.ownerEmail !== '—' && (
                  <span className="text-xs text-gray-500 block" dir="ltr">
                    {viewingMarket.ownerEmail}
                  </span>
                )}
              </p>
              <p>
                <span className="font-semibold">البريد:</span>{' '}
                <span dir="ltr">{viewingMarket.email}</span>
              </p>
              <p>
                <span className="font-semibold">الهاتف:</span>{' '}
                <span dir="ltr">{viewingMarket.phone || '—'}</span>
              </p>
              <p>
                <span className="font-semibold">التوثيق:</span>{' '}
                {viewingMarket.isVerified ? 'موثق' : 'غير موثق'}
              </p>
              <p>
                <span className="font-semibold">المنتجات / الفروع:</span>{' '}
                {viewingMarket.productsCount} / {viewingMarket.branchesCount}
              </p>
              <p>
                <span className="font-semibold">تاريخ الإنشاء:</span> {viewingMarket.createdAt}
              </p>
              <p>
                <span className="font-semibold">تاريخ الموافقة:</span>{' '}
                {viewingMarket.approvedAt || '—'}
              </p>
            </div>

            <div className="text-xs md:text-sm text-gray-700">
              <span className="font-semibold">الوصف: </span>
              <span>{viewingMarket.description || '—'}</span>
            </div>

            {/* روابط التواصل الاجتماعي */}
            {(viewingMarket.facebookUrl ||
              viewingMarket.instagramUrl ||
              viewingMarket.whatsappUrl) && (
              <div className="pt-1 space-y-1.5 text-xs">
                <p className="font-semibold text-gray-800">روابط التواصل الاجتماعي:</p>
                <div className="flex flex-wrap gap-2">
                  {viewingMarket.facebookUrl && (
                    <a
                      href={viewingMarket.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      <span>Facebook</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {viewingMarket.instagramUrl && (
                    <a
                      href={viewingMarket.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-pink-50 text-pink-700 hover:bg-pink-100"
                    >
                      <span>Instagram</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {viewingMarket.whatsappUrl && (
                    <a
                      href={viewingMarket.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    >
                      <span>WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* أزرار التحكم السريعة والإغلاق */}
            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              {renderActionButtons(viewingMarket, true)}
              <button
                type="button"
                onClick={() => setViewingMarket(null)}
                className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل المتجر */}
      {editingMarket && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={(e) => void handleSaveEdit(e)}
            className="bg-surface rounded-xl border border-gray-200 max-w-md w-full p-5 space-y-4 text-right"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h2 className="text-base font-bold text-gray-900">تعديل المتجر</h2>
              <button
                type="button"
                onClick={() => setEditingMarket(null)}
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">اسم المتجر</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  dir="ltr"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  dir="ltr"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">الوصف</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={mutating}
                onClick={() => setEditingMarket(null)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={mutating}
                className="px-4 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                {mutating ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* نافذة رفض المتجر */}
      {rejectingMarket && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={(e) => void handleConfirmReject(e)}
            className="bg-surface rounded-xl border border-gray-200 max-w-sm w-full p-5 space-y-4 text-right"
          >
            <h2 className="text-base font-bold text-gray-900">
              رفض المتجر: {rejectingMarket.name}
            </h2>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">سبب الرفض</label>
              <input
                type="text"
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={mutating}
                onClick={() => setRejectingMarket(null)}
                className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={mutating}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                {mutating ? 'جارٍ الرفض...' : 'تأكيد الرفض'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

interface MarketsProps {
  searchQuery?: string;
  onReviewsClick?: () => void;
}

const Markets: React.FC<MarketsProps> = ({ searchQuery = '', onReviewsClick }) => {
  return (
    <ShopServiceProvider>
      <MarketsContent searchQuery={searchQuery} onReviewsClick={onReviewsClick} />
    </ShopServiceProvider>
  );
};

export default Markets;