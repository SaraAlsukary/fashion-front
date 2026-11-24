import React, { useMemo, useState } from 'react';
import {
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export type OrderStatus =
  | 'قيد الانتظار'
  | 'موافق عليها'
  | 'مرفوضة'
  | 'قيد المعالجة'
  | 'تم الشحن'
  | 'معلقة'
  | 'ملغاة';

export type OrderQuickTab =
  | 'ALL'
  | 'قيد المعالجة'
  | 'تم الشحن'
  | 'معلقة'
  | 'ملغاة';

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  amount: string;
  status: OrderStatus;
}

const initialOrders: AdminOrderRow[] = [
  {
    id: '1',
    orderNumber: '#ord1001',
    customerName: 'سبور شيك',
    orderDate: '22/12/2026',
    amount: '5000ل.س.ج',
    status: 'قيد الانتظار',
  },
  {
    id: '2',
    orderNumber: '#ord1001',
    customerName: 'محمد محمد',
    orderDate: '22/12/2026',
    amount: '5000ل.س.ج',
    status: 'موافق عليها',
  },
  {
    id: '3',
    orderNumber: '#ord1001',
    customerName: 'محمد محمد',
    orderDate: '22/12/2026',
    amount: '5000ل.س.ج',
    status: 'مرفوضة',
  },
  {
    id: '4',
    orderNumber: '#ord1001',
    customerName: 'محمد محمد',
    orderDate: '22/12/2026',
    amount: '5000ل.س.ج',
    status: 'مرفوضة',
  },
];

const statusBadgeClasses: Record<OrderStatus, string> = {
  'قيد الانتظار': 'bg-amber-100/90 text-amber-700',
  'موافق عليها': 'bg-emerald-100/90 text-emerald-700',
  مرفوضة: 'bg-rose-100/90 text-rose-600',
  'قيد المعالجة': 'bg-amber-100/90 text-amber-700',
  'تم الشحن': 'bg-emerald-100/90 text-emerald-700',
  معلقة: 'bg-slate-200 text-slate-700',
  ملغاة: 'bg-rose-100/90 text-rose-600',
};

const quickTabs: { key: OrderQuickTab; label: string }[] = [
  { key: 'ALL', label: 'كل الطلبات' },
  { key: 'قيد المعالجة', label: 'قيد المعالجة' },
  { key: 'تم الشحن', label: 'تم الشحن' },
  { key: 'معلقة', label: 'معلقة' },
  { key: 'ملغاة', label: 'ملغاة' },
];

interface OrdersProps {
  orders?: AdminOrderRow[];
  totalCount?: number;
  onViewOrder?: (order: AdminOrderRow) => void;
}

const Orders: React.FC<OrdersProps> = ({
  orders = initialOrders,
  totalCount = 17,
  onViewOrder,
}) => {
  const [activeTab, setActiveTab] = useState<OrderQuickTab>('ALL');
  const [topSearch, setTopSearch] = useState('');
  const [orderNumberFilter, setOrderNumberFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    topSearch: '',
    orderNumber: '',
    date: '',
    status: '',
    customer: '',
  });
  const [activePage, setActivePage] = useState<number>(4);

  const pages = useMemo(() => [2, 3, 4, 10], []);

  const handleApplyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    setAppliedFilters({
      topSearch: topSearch.trim().toLowerCase(),
      orderNumber: orderNumberFilter.trim().toLowerCase(),
      date: dateFilter.trim().toLowerCase(),
      status: statusFilter.trim(),
      customer: customerFilter.trim().toLowerCase(),
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab = activeTab === 'ALL' || order.status === activeTab;
      const matchesTop =
        !appliedFilters.topSearch ||
        order.orderNumber.toLowerCase().includes(appliedFilters.topSearch) ||
        order.customerName.toLowerCase().includes(appliedFilters.topSearch) ||
        order.amount.toLowerCase().includes(appliedFilters.topSearch);
      const matchesOrderNum =
        !appliedFilters.orderNumber ||
        order.orderNumber.toLowerCase().includes(appliedFilters.orderNumber);
      const matchesDate =
        !appliedFilters.date ||
        order.orderDate.toLowerCase().includes(appliedFilters.date);
      const matchesStatus =
        !appliedFilters.status || order.status === appliedFilters.status;
      const matchesCustomer =
        !appliedFilters.customer ||
        order.customerName.toLowerCase().includes(appliedFilters.customer);

      return (
        matchesTab &&
        matchesTop &&
        matchesOrderNum &&
        matchesDate &&
        matchesStatus &&
        matchesCustomer
      );
    });
  }, [orders, activeTab, appliedFilters]);

  return (
    <div className="space-y-4">
      {/* العنوان والمسار */}
      <div>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">
          ادارة الطلبات
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          الرئيسية &lt; المتاجر
        </p>
      </div>

      {/* تبويبات حالة الطلب السريعة */}
      <div className="flex flex-wrap items-center gap-2.5">
        {quickTabs.map((tab) => {
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

      {/* شريط فلاتر البحث المتقدمة */}
      <form
        onSubmit={handleApplyFilters}
        className="flex flex-wrap items-center gap-2.5 pt-0.5"
      >
        <div className="relative flex-1 min-w-[140px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={orderNumberFilter}
            onChange={(e) => setOrderNumberFilter(e.target.value)}
            placeholder="رقم الطلب"
            className="w-full pr-9 pl-3 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand"
          />
        </div>

        <input
          type="text"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          placeholder="تاريخ الطلب"
          className="flex-1 min-w-[130px] px-3 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand"
        />

        <div className="relative flex-1 min-w-[140px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="حالة الطلب"
            className="w-full appearance-none pr-3 pl-8 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand cursor-pointer"
          >
            <option value="">حالة الطلب</option>
            <option value="قيد الانتظار">قيد الانتظار</option>
            <option value="موافق عليها">موافق عليها</option>
            <option value="مرفوضة">مرفوضة</option>
            <option value="قيد المعالجة">قيد المعالجة</option>
            <option value="تم الشحن">تم الشحن</option>
            <option value="معلقة">معلقة</option>
            <option value="ملغاة">ملغاة</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <input
          type="text"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          placeholder="العميل"
          className="flex-1 min-w-[140px] px-3 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand"
        />

        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold transition-colors cursor-pointer shrink-0"
        >
          بحث
        </button>
      </form>

      {/* جدول الطلبات */}
      <div className="bg-surface-muted/70 rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-gray-200/85 text-gray-800 text-xs md:text-sm font-semibold">
                <th className="py-3 px-4">العمليات</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">تاريخ الطلب</th>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">رقم الطلب</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200/80 text-xs md:text-sm text-gray-700">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-surface/80 transition-colors"
                >
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => onViewOrder?.(order)}
                      className="px-4 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      عرض
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block min-w-[78px] px-3 py-1 rounded-md text-xs font-semibold ${
                        statusBadgeClasses[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td
                    className="py-3 px-4 font-medium text-gray-700"
                    dir="ltr"
                  >
                    {order.amount}
                  </td>

                  <td className="py-3 px-4 font-medium text-gray-700">
                    {order.orderDate}
                  </td>

                  <td className="py-3 px-4">
                    <div className="inline-flex items-center justify-center gap-2 text-gray-800 font-medium">
                      <span>{order.customerName}</span>
                      <span className="w-5 h-5 rounded-full border border-gray-500 inline-flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-gray-600" />
                      </span>
                    </div>
                  </td>

                  <td
                    className="py-3 px-4 font-medium text-gray-800"
                    dir="ltr"
                  >
                    {order.orderNumber}
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-sm text-gray-500">
                    لا توجد طلبات مطابقة
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

export default Orders;