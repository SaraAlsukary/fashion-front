import React, { useMemo, useState } from 'react';
import {
  Eye,
  Trash2,
  SquarePen,
  Search,
  Plus,
  Repeat,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type SubscriptionStatus = 'نشط' | 'منتهي' | 'ملغى';

export interface AdminSubscriptionRow {
  id: string;
  planName: string;
  price: string;
  duration: string;
  status: SubscriptionStatus;
}

const initialSubscriptions: AdminSubscriptionRow[] = [
  {
    id: '1',
    planName: 'الباقة الأساسية',
    price: '5000ل.س.ج',
    duration: 'شهري',
    status: 'نشط',
  },
  {
    id: '2',
    planName: 'الباقة المتقدمة',
    price: '12000ل.س.ج',
    duration: 'ربع سنوي',
    status: 'نشط',
  },
  {
    id: '3',
    planName: 'باقة المتاجر الكبرى',
    price: '40000ل.س.ج',
    duration: 'سنوي',
    status: 'منتهي',
  },
  {
    id: '4',
    planName: 'الباقة التجريبية',
    price: '2500ل.س.ج',
    duration: 'أسبوعي',
    status: 'ملغى',
  },
];

const statusBadgeClasses: Record<SubscriptionStatus, string> = {
  نشط: 'bg-emerald-100/90 text-emerald-700',
  منتهي: 'bg-amber-100/90 text-amber-700',
  ملغى: 'bg-rose-100/90 text-rose-600',
};

interface SubscriptionsProps {
  subscriptions?: AdminSubscriptionRow[];
  totalCount?: number;
  onAddSubscription?: () => void;
  onViewSubscription?: (sub: AdminSubscriptionRow) => void;
  onEditSubscription?: (sub: AdminSubscriptionRow) => void;
  onDeleteSubscription?: (sub: AdminSubscriptionRow) => void;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({
  subscriptions = initialSubscriptions,
  totalCount = 17,
  onAddSubscription,
  onViewSubscription,
  onEditSubscription,
  onDeleteSubscription,
}) => {
  const [rows, setRows] = useState<AdminSubscriptionRow[]>(subscriptions);
  const [searchInput, setSearchInput] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [activePage, setActivePage] = useState<number>(2);

  const pages = useMemo(() => [1, 2, 3, 10], []);

  const filteredSubscriptions = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (item) =>
        item.planName.toLowerCase().includes(q) ||
        item.price.toLowerCase().includes(q) ||
        item.duration.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
    );
  }, [rows, appliedQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedQuery(searchInput);
  };

  const handleDelete = (subItem: AdminSubscriptionRow) => {
    setRows((prev) => prev.filter((item) => item.id !== subItem.id));
    onDeleteSubscription?.(subItem);
  };

  return (
    <div className="space-y-4">
      {/* العنوان والمسار */}
      <div>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">
          ادارة الاشتراكات
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          الرئيسية &lt; الاشتراكات
        </p>
      </div>

      {/* شريط البحث وزر بحث وزر إضافة اشتراك */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-wrap items-center gap-3 pt-0.5"
      >
        <div className="relative flex-1 min-w-[200px]">
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
            placeholder="البحث عن اشتراك أو باقة"
            className="w-full pr-10 pl-4 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold transition-colors cursor-pointer shrink-0"
        >
          بحث
        </button>

        <button
          type="button"
          onClick={onAddSubscription}
          className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>اضافة اشتراك</span>
        </button>
      </form>

      {/* جدول الاشتراكات */}
      <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[680px]">
            <thead>
              <tr className="bg-gray-200/85 text-gray-800 text-xs md:text-sm font-semibold">
                <th className="py-3 px-4">العمليات</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">المدة</th>
                <th className="py-3 px-4">السعر</th>
                <th className="py-3 px-4">اسم الخطة</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/80 text-xs md:text-sm text-gray-700">
              {filteredSubscriptions.map((subItem) => (
                <tr
                  key={subItem.id}
                  className="hover:bg-surface/80 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center justify-center gap-3.5 text-gray-800">
                      <button
                        type="button"
                        onClick={() => onViewSubscription?.(subItem)}
                        aria-label={`عرض ${subItem.planName}`}
                        className="hover:text-brand transition-colors cursor-pointer"
                      >
                        <Eye className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(subItem)}
                        aria-label={`حذف ${subItem.planName}`}
                        className="hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditSubscription?.(subItem)}
                        aria-label={`تعديل ${subItem.planName}`}
                        className="hover:text-brand transition-colors cursor-pointer"
                      >
                        <SquarePen className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block min-w-[64px] px-3 py-1 rounded-md text-xs font-semibold ${
                        statusBadgeClasses[subItem.status]
                      }`}
                    >
                      {subItem.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-medium text-gray-700">
                    {subItem.duration}
                  </td>

                  <td
                    className="py-3 px-4 font-medium text-gray-700"
                    dir="ltr"
                  >
                    {subItem.price}
                  </td>

                  <td className="py-3 px-4">
                    <div className="inline-flex items-center justify-center gap-2 text-gray-800 font-medium">
                      <span>{subItem.planName}</span>
                      <span className="w-5 h-5 rounded-full border border-gray-500 inline-flex items-center justify-center shrink-0">
                        <Repeat className="w-3 h-3 text-gray-600" />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSubscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-sm text-gray-500">
                    لا توجد اشتراكات مطابقة
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

export default Subscriptions;