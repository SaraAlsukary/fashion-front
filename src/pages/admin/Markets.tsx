import React, { useMemo, useState } from 'react';
import {
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type MarketStatus = 'قيد الانتظار' | 'موافق عليها' | 'مرفوضة';
export type MarketFilterTab = 'ALL' | MarketStatus;

export interface AdminMarketRow {
  id: string;
  name: string;
  email: string;
  status: MarketStatus;
  createdAt: string;
}

const initialMarkets: AdminMarketRow[] = [
  {
    id: '1',
    name: 'سبور شيك',
    email: 'moh2323@gmail.com',
    status: 'قيد الانتظار',
    createdAt: '22/12/2026',
  },
  {
    id: '2',
    name: 'محمد محمد',
    email: 'moh2323@gmail.com',
    status: 'موافق عليها',
    createdAt: '22/12/2026',
  },
  {
    id: '3',
    name: 'محمد محمد',
    email: 'moh2323@gmail.com',
    status: 'مرفوضة',
    createdAt: '22/12/2026',
  },
  {
    id: '4',
    name: 'محمد محمد',
    email: 'moh2323@gmail.com',
    status: 'مرفوضة',
    createdAt: '22/12/2026',
  },
];

const statusBadgeClasses: Record<MarketStatus, string> = {
  'قيد الانتظار': 'bg-amber-100/90 text-amber-700',
  'موافق عليها': 'bg-emerald-100/90 text-emerald-700',
  مرفوضة: 'bg-rose-100/90 text-rose-600',
};

const filterTabs: { key: MarketFilterTab; label: string }[] = [
  { key: 'ALL', label: 'كل المتاجر' },
  { key: 'موافق عليها', label: 'المتاجر المقبولة' },
  { key: 'مرفوضة', label: 'المتاجر المرفوضة' },
  { key: 'قيد الانتظار', label: 'المتاجر قيد الانتظار' },
];

interface MarketsProps {
  markets?: AdminMarketRow[];
  totalCount?: number;
  searchQuery?: string;
  onViewMarket?: (market: AdminMarketRow) => void;
  onApproveMarket?: (market: AdminMarketRow) => void;
  onRejectMarket?: (market: AdminMarketRow) => void;
  onBlockMarket?: (market: AdminMarketRow) => void;
  onDeleteMarket?: (market: AdminMarketRow) => void;
  onReviewsClick?: () => void;
}

const Markets: React.FC<MarketsProps> = ({
  markets = initialMarkets,
  totalCount = 17,
  searchQuery = '',
  onViewMarket,
  onApproveMarket,
  onRejectMarket,
  onBlockMarket,
  onDeleteMarket,
  onReviewsClick,
}) => {
  const [rows, setRows] = useState<AdminMarketRow[]>(markets);
  const [activeTab, setActiveTab] = useState<MarketFilterTab>('ALL');
  const [activePage, setActivePage] = useState<number>(3);

  const pages = useMemo(() => [1, 2, 3, 10], []);

  const filteredMarkets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((m) => {
      const matchesTab = activeTab === 'ALL' || m.status === activeTab;
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.status.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [rows, activeTab, searchQuery]);

  const handleStatusChange = (
    market: AdminMarketRow,
    nextStatus: MarketStatus,
    callback?: (m: AdminMarketRow) => void
  ) => {
    setRows((prev) =>
      prev.map((item) =>
        item.id === market.id ? { ...item, status: nextStatus } : item
      )
    );
    callback?.({ ...market, status: nextStatus });
  };

  const handleDelete = (market: AdminMarketRow) => {
    setRows((prev) => prev.filter((item) => item.id !== market.id));
    onDeleteMarket?.(market);
  };

  return (
    <div className="space-y-4">
      {/* العنوان والمسار وزر مراجعات المتاجر */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            ادارة المتاجر
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            الرئيسية &lt; المتاجر
          </p>
        </div>

        <button
          type="button"
          onClick={onReviewsClick}
          className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          مراجعااات المتاجر
        </button>
      </div>

      {/* أزرار التصفية حسب الحالة */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {filterTabs.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
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

      {/* جدول المتاجر */}
      <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[720px]">
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
              {filteredMarkets.map((market) => (
                <tr
                  key={market.id}
                  className="hover:bg-surface/80 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center justify-center gap-2 flex-wrap">
                      {market.status === 'قيد الانتظار' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                market,
                                'مرفوضة',
                                onRejectMarket
                              )
                            }
                            className="px-3.5 py-1 rounded-md bg-rose-200/90 hover:bg-rose-300 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            رفض
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                market,
                                'موافق عليها',
                                onApproveMarket
                              )
                            }
                            className="px-3.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            قبول
                          </button>
                        </>
                      )}

                      {market.status === 'موافق عليها' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              market,
                              'مرفوضة',
                              onBlockMarket
                            )
                          }
                          className="px-3.5 py-1 rounded-md bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          حظر
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onViewMarket?.(market)}
                        className="px-3.5 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        عرض
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(market)}
                        className="px-3.5 py-1 rounded-md bg-rose-200/90 hover:bg-rose-300 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        حذف
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-gray-700">
                    {market.createdAt}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block min-w-[78px] px-3 py-1 rounded-md text-xs font-semibold ${
                        statusBadgeClasses[market.status]
                      }`}
                    >
                      {market.status}
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
                      <span className="w-5 h-5 rounded-full border border-gray-500 inline-flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-gray-600" />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredMarkets.length === 0 && (
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
            onClick={() => setActivePage((p) => Math.min(10, p + 1))}
            aria-label="الصفحة التالية"
            className="w-8 h-8 rounded-md border border-gray-300 bg-surface flex items-center justify-center hover:border-brand hover:text-brand transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {pages.map((page) => {
            const isCurrent = activePage === page;
            return (
              <button
                key={page}
                type="button"
                onClick={() => setActivePage(page)}
                className={`w-8 h-8 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-brand text-white border-brand'
                    : 'bg-surface text-gray-800 border-gray-300 hover:border-brand'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActivePage((p) => Math.max(1, p - 1))}
            aria-label="الصفحة السابقة"
            className="w-8 h-8 rounded-md border border-gray-300 bg-surface flex items-center justify-center hover:border-brand hover:text-brand transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="text-gray-700 font-medium">
          عرض {activePage} من {totalCount}
        </div>
      </div>
    </div>
  );
};

export default Markets;