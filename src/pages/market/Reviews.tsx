import React, { useMemo, useState } from 'react';
import {
  Eye,
  Search,
  User,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  useReviewSummary,
  useShopReviews,
} from '../../hooks/market/useReviews';
import type { ReviewApi } from '../../services/market/reviewsService';

export interface MarketReviewRow {
  id: string;
  customerName: string;
  comment: string;
  rating: number;
  status: string;
  commentDate: string;
}

interface MarketReviewsProps {
  onViewReview?: (review: MarketReviewRow) => void;
}

const formatReviewDate = (raw?: string): string => {
  if (!raw) return '-';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const statusBadgeMap: Record<string, string> = {
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const statusLabelMap: Record<string, string> = {
  APPROVED: 'مقبول',
  PENDING: 'قيد المراجعة',
  REJECTED: 'مرفوض',
};

const MarketReviews: React.FC<MarketReviewsProps> = ({ onViewReview }) => {
  const [searchInput, setSearchInput] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(
    undefined
  );
  const [page, setPage] = useState<number>(1);
  const [selectedReview, setSelectedReview] = useState<MarketReviewRow | null>(
    null
  );

  const limit = 10;

  const { data, isLoading, error } = useShopReviews({
    page,
    limit,
    rating: ratingFilter,
    sortBy: 'newest',
    sortOrder: 'desc',
  });

  const { data: summaryRes } = useReviewSummary();

  const rows: MarketReviewRow[] = useMemo(() => {
    const apiReviews: ReviewApi[] = data?.data ?? [];
    return apiReviews.map((item, index) => ({
      id: String(item.id ?? index + 1),
      customerName:
        item.customerDisplayName ||
        item.customer_name ||
        item.customerName ||
        'عميل المتجر',
      comment: item.comment || '-',
      rating: Number(item.rating ?? 0),
      status: (item.status || 'APPROVED').toUpperCase(),
      commentDate: formatReviewDate(item.created_at ?? item.createdAt),
    }));
  }, [data]);

  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const totalCount = meta?.total ?? rows.length;

  const filteredReviews = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (item) =>
        item.customerName.toLowerCase().includes(q) ||
        item.comment.toLowerCase().includes(q) ||
        item.commentDate.toLowerCase().includes(q)
    );
  }, [rows, appliedQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedQuery(searchInput);
  };

  const handleView = (review: MarketReviewRow) => {
    setSelectedReview(review);
    onViewReview?.(review);
  };

  const renderStars = (rating: number) => {
    const clamped = Math.max(0, Math.min(5, Math.round(rating)));
    return (
      <div
        className="inline-flex items-center justify-center gap-1"
        dir="ltr"
        aria-label={`التقييم ${clamped} من 5`}
      >
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = index < clamped;
          return (
            <Star
              key={index}
              className={`w-4 h-4 ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-amber-400/80'
              }`}
            />
          );
        })}
      </div>
    );
  };

  const summaryAvg = summaryRes?.data?.averageRating;
  const summaryTotal = summaryRes?.data?.totalReviews ?? totalCount;

  return (
    <div className="space-y-4">
      {/* العنوان والمسار وملخص التقييمات */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            مراجعات المتاجر
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            الرئيسية &lt; مراجعة المتاجر
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-soft text-brand text-xs font-semibold self-start sm:self-auto">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>
            {summaryAvg !== undefined ? `${summaryAvg} / 5` : 'التقييمات'} •{' '}
            {summaryTotal} مراجعة
          </span>
        </div>
      </div>

      {/* شريط البحث وفلتر النجوم */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-wrap items-center gap-3 pt-0.5"
      >
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (!e.target.value.trim()) {
                setAppliedQuery('');
              }
            }}
            placeholder="البحث عن عميل أو تعليق"
            className="w-full pr-10 pl-4 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        <select
          value={ratingFilter ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            setRatingFilter(val ? Number(val) : undefined);
            setPage(1);
          }}
          aria-label="تصفية حسب التقييم"
          className="px-3 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand cursor-pointer"
        >
          <option value="">كل التقييمات</option>
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>
              {star} نجوم
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold transition-colors cursor-pointer shrink-0"
        >
          بحث
        </button>
      </form>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-xs md:text-sm">
          {error.message}
        </div>
      )}

      {/* جدول المراجعات */}
      <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-gray-200/85 text-gray-800 text-xs md:text-sm font-semibold">
                <th className="py-3 px-4">العمليات</th>
                <th className="py-3 px-4">تاريخ التعليق</th>
                <th className="py-3 px-4">التقييم</th>
                <th className="py-3 px-4">التعليق</th>
                <th className="py-3 px-4">العميل</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/80 text-xs md:text-sm text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-sm text-gray-500">
                    جاري تحميل المراجعات...
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr
                    key={review.id}
                    className="hover:bg-surface/80 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center justify-center gap-3.5 text-gray-800">
                        <button
                          type="button"
                          onClick={() => handleView(review)}
                          aria-label={`عرض مراجعة ${review.customerName}`}
                          className="hover:text-brand transition-colors cursor-pointer"
                        >
                          <Eye className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-medium text-gray-700 whitespace-nowrap">
                      {review.commentDate}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderStars(review.rating)}
                    </td>

                    <td className="py-3 px-4 text-gray-700 leading-relaxed max-w-xs mx-auto">
                      {review.comment}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-2 text-gray-800 font-medium">
                        <span>{review.customerName}</span>
                        <span className="w-5 h-5 rounded-full border border-gray-500 inline-flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-gray-600" />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!isLoading && filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-sm text-gray-500">
                    لا توجد مراجعات مطابقة
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
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="الصفحة التالية"
            className="w-8 h-8 rounded-md border border-gray-300 bg-surface disabled:opacity-50 flex items-center justify-center hover:border-brand hover:text-brand transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
            (pageNum) => {
              const isCurrent = page === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-brand text-white border-brand'
                      : 'bg-surface text-gray-800 border-gray-300 hover:border-brand'
                  }`}
                >
                  {pageNum}
                </button>
              );
            }
          )}

          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="الصفحة السابقة"
            className="w-8 h-8 rounded-md border border-gray-300 bg-surface disabled:opacity-50 flex items-center justify-center hover:border-brand hover:text-brand transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="text-gray-700 font-medium">
          عرض {filteredReviews.length} من {totalCount}
        </div>
      </div>

      {/* نافذة عرض تفاصيل المراجعة */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-gray-200 rounded-2xl max-w-md w-full p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <h2 className="text-sm md:text-base font-bold text-gray-900">
                تفاصيل المراجعة — {selectedReview.customerName}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                aria-label="إغلاق"
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              {renderStars(selectedReview.rating)}
              <span
                className={`px-2.5 py-0.5 rounded-md border font-semibold ${
                  statusBadgeMap[selectedReview.status] ??
                  'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                {statusLabelMap[selectedReview.status] ?? selectedReview.status}
              </span>
            </div>

            <p className="text-xs md:text-sm text-gray-700 leading-relaxed bg-surface-muted/60 p-3 rounded-xl">
              {selectedReview.comment}
            </p>

            <p className="text-[11px] text-gray-500">
              تاريخ التعليق: {selectedReview.commentDate}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketReviews;