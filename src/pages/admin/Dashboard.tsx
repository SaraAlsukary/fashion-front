import React, { useMemo, useRef, useState } from 'react';
import {
  Store,
  ClipboardList,
  CircleDollarSign,
  BadgePercent,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  User,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAdmin } from '../../hooks/admin/useAdmin';
import { type AdminOrderItem, type DashboardOverviewData } from '../../services/admin/AdminService';

type OrderStatus = 'قيد المعالجة' | 'تم الشحن' | 'معلق';

interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  comparison: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  amount: string;
  date: string;
}

interface SalesPoint {
  day: string;
  sales: number;
}

const fallbackWeeklySalesData: SalesPoint[] = [
  { day: 'الاحد', sales: 530 },
  { day: 'الاثنين', sales: 780 },
  { day: 'الثلاثاء', sales: 1220 },
  { day: 'الاربعاء', sales: 930 },
  { day: 'الخميس', sales: 1410 },
  { day: 'الجمعة', sales: 1560 },
  { day: 'السبت', sales: 1620 },
];

const statusBadgeStyle: Record<OrderStatus, string> = {
  'قيد المعالجة': 'bg-amber-100/90 text-amber-700',
  'تم الشحن': 'bg-emerald-100/90 text-emerald-700',
  'معلق': 'bg-rose-100/90 text-rose-600',
};

function mapOrderStatus(rawStatus: string): OrderStatus {
  const normalized = rawStatus.trim().toUpperCase();
  if (normalized === 'DELIVERED' || normalized === 'COMPLETED' || normalized === 'SHIPPED') {
    return 'تم الشحن';
  }
  if (normalized === 'PENDING' || normalized === 'ON_HOLD' || normalized === 'CANCELLED') {
    return 'معلق';
  }
  return 'قيد المعالجة';
}

function formatAmount(amount: string | number): string {
  const numeric = Number(amount);
  const formatted = Number.isFinite(numeric) ? numeric.toLocaleString('ar-SY') : String(amount);
  return `${formatted} ل.س.ج`;
}

function formatDateDisplay(rawDate: string): string {
  if (!rawDate) return '—';
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;
  return parsed.toLocaleDateString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function buildStatCards(overview: DashboardOverviewData | null): StatCard[] {
  const usersTotal = overview?.users?.total ?? 0;
  const shopsTotal = overview?.shops?.total ?? 0;
  const ordersTotal = overview?.orders?.total ?? 0;
  const successfulPayments = overview?.financial?.successfulPayments ?? 0;
  const subscriptionsTotal = overview?.subscriptions?.total ?? 0;
  const pendingShops = overview?.shops?.pending ?? 0;

  return [
    {
      id: 'users',
      title: 'اجمالي المستخدمين',
      value: `${usersTotal} مستخدم`,
      change: `${overview?.users?.active ?? usersTotal} نشط ↑`,
      comparison: `عملاء: ${overview?.users?.customers ?? 0} | متاجر: ${overview?.users?.shopOwners ?? 0}`,
      icon: Users,
    },
    {
      id: 'markets',
      title: 'اجمالي المتاجر',
      value: `${shopsTotal} متجر`,
      change: `${overview?.shops?.approved ?? 0} معتمد ↑`,
      comparison: 'مقارنة بالشهر الماضي',
      icon: Store,
    },
    {
      id: 'orders',
      title: 'اجمالي الطلبات',
      value: `${ordersTotal} طلب`,
      change: `${overview?.orders?.completed ?? 0} مكتمل ↑`,
      comparison: 'مقارنة بالشهر الماضي',
      icon: ClipboardList,
    },
    {
      id: 'profit',
      title: 'اجمالي الربح',
      value: formatAmount(successfulPayments),
      change: `اشتراكات: ${overview?.financial?.subscriptionRevenue ?? 0} ↑`,
      comparison: 'المدفوعات الناجحة',
      icon: CircleDollarSign,
    },
    {
      id: 'subscriptions',
      title: 'اجمالي الاشتراكات',
      value: `${subscriptionsTotal} اشتراك`,
      change: `${overview?.subscriptions?.active ?? 0} نشط ↑`,
      comparison: 'مقارنة بالشهر الماضي',
      icon: BadgePercent,
    },
    {
      id: 'pending-markets',
      title: 'المتاجر قيد الانتظار',
      value: `${pendingShops} متجر`,
      change: `${pendingShops} بانتظار المراجعة`,
      comparison: 'مقارنة بالشهر الماضي',
      icon: Store,
    },
  ];
}

function toOrderRow(item: AdminOrderItem): OrderRow {
  return {
    id: item.id,
    orderNumber: item.orderNumber,
    customerName: item.customerName,
    status: mapOrderStatus(item.status),
    amount: formatAmount(item.amount),
    date: formatDateDisplay(item.date),
  };
}

interface DashboardProps {
  onViewOrder?: (order: OrderRow) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewOrder }) => {
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  const pageSize = 10;

  const {
    overview,
    orders: rawOrders,
    salesPoints,
    totalOrders,
    totalPages,
    loading,
    ordersLoading,
    error,
    refetch,
  } = useAdmin({
    page: activePage,
    limit: pageSize,
    salesDays: 7,
  });

  const statCards = useMemo(() => buildStatCards(overview), [overview]);

  const orderRows = useMemo<OrderRow[]>(() => {
    if (rawOrders.length > 0) {
      return rawOrders.map(toOrderRow);
    }

    const fallbackRecent = overview?.recentActivity?.orders ?? [];
    return fallbackRecent.map((o, idx) => ({
      id: String(o.id ?? idx + 1),
      orderNumber: o.order_number || o.orderNumber || `#ORD-${o.id ?? idx + 1}`,
      customerName: o.customer_name || o.customerName || o.user?.name || 'عميل',
      status: mapOrderStatus(o.status || 'PROCESSING'),
      amount: formatAmount(o.total ?? o.amount ?? 0),
      date: formatDateDisplay(o.created_at || o.createdAt || ''),
    }));
  }, [rawOrders, overview]);

  const chartData = useMemo<SalesPoint[]>(() => {
    if (!salesPoints.length) return fallbackWeeklySalesData;
    return salesPoints.map((pt) => ({
      day: pt.label || formatDateDisplay(pt.label),
      sales: pt.sales,
    }));
  }, [salesPoints]);

  const pages = useMemo(() => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    const set = new Set<number>([1, activePage, Math.min(totalPages, activePage + 1), totalPages]);
    return Array.from(set)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }, [totalPages, activePage]);

  const scrollStats = (direction: 'left' | 'right') => {
    if (!statsContainerRef.current) return;
    const offset = direction === 'left' ? -240 : 240;
    statsContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleOpenOrder = (order: OrderRow) => {
    setSelectedOrder(order);
    onViewOrder?.(order);
  };

  return (
    <div className="space-y-6">
      {/* العنوان الفرعي */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            نظرة عامة عن المتجر
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:border-brand hover:text-brand transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث</span>
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs md:text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* شريط البطاقات الإحصائية */}
      <div className="relative flex items-center gap-1">
        <button
          type="button"
          onClick={() => scrollStats('right')}
          aria-label="التمرير لليمين"
          className="p-1 text-gray-400 hover:text-brand transition-colors shrink-0 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div
          ref={statsContainerRef}
          className="flex-1 flex items-stretch gap-3 overflow-x-auto no-scrollbar py-1"
        >
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="min-w-[165px] flex-1 bg-surface border border-gray-300 rounded-xl px-3.5 py-2.5 flex flex-col justify-between hover:border-brand/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-gray-900 truncate">
                    {stat.title}
                  </span>
                  <Icon className="w-4 h-4 text-brand shrink-0" />
                </div>

                <div className="text-xs font-bold text-gray-900 mb-1">
                  {loading ? '...' : stat.value}
                </div>

                <div className="flex items-center justify-between gap-1 text-[10px]">
                  <span className="text-gray-400 truncate">{stat.comparison}</span>
                  <span className="text-emerald-600 font-semibold whitespace-nowrap">
                    {stat.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollStats('left')}
          aria-label="التمرير لليسار"
          className="p-1 text-gray-400 hover:text-brand transition-colors shrink-0 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* جدول الطلبات */}
      <div className="relative bg-surface-muted/70 rounded-xl pt-1 pb-6 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-200/80 text-gray-800 text-xs md:text-sm font-semibold">
                <th className="py-3 px-4">المنتجات</th>
                <th className="py-3 px-4">تاريخ الطلب</th>
                <th className="py-3 px-4">المبلغ</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">العميل</th>
                <th className="py-3 px-4">رقم الطلب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/80 text-xs md:text-sm text-gray-700">
              {ordersLoading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-gray-500">
                    جارٍ تحميل الطلبات...
                  </td>
                </tr>
              ) : orderRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-gray-500">
                    لا توجد طلبات متاحة حالياً
                  </td>
                </tr>
              ) : (
                orderRows.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface/80 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleOpenOrder(order)}
                        aria-label={`معاينة منتجات الطلب ${order.orderNumber}`}
                        className="inline-flex items-center justify-center text-gray-800 hover:text-brand transition-colors cursor-pointer"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium">{order.date}</td>
                    <td className="py-3 px-4 font-medium">{order.amount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3.5 py-1 rounded-md text-xs font-semibold ${statusBadgeStyle[order.status]
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center justify-center gap-2">
                        <span>{order.customerName}</span>
                        <span className="w-5 h-5 rounded-full border border-gray-500 inline-flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-600" />
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium" dir="ltr">
                      {order.orderNumber}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* شارة "كل الطلبات" في أسفل الجدول */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="bg-surface-muted border border-gray-200 text-gray-600 text-xs px-6 py-1.5 rounded-b-xl shadow-xs">
            كل الطلبات
          </div>
          <ChevronDown className="w-4 h-4 text-white -mt-1 drop-shadow-xs" />
        </div>
      </div>

      {/* مخطط المبيعات خلال آخر 7 أيام */}
      <div className="bg-surface border border-gray-200 rounded-xl p-4 md:p-6 pt-5">
        <h2 className="text-center text-sm md:text-base font-bold text-gray-900 mb-4">
          المبيعات خلال اخر 7 يوم
        </h2>

        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="brandSalesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9e2b52" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#6b1d37" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="day"
                reversed
                tick={{ fill: '#374151', fontSize: 12 }}
                axisLine={{ stroke: '#d1d5db' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#374151', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  borderColor: '#6b1d37',
                  fontSize: '12px',
                  textAlign: 'right',
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#8a8688"
                strokeWidth={1.75}
                fill="url(#brandSalesFill)"
                dot={{
                  r: 4,
                  fill: '#4b5563',
                  stroke: '#4b5563',
                }}
                activeDot={{
                  r: 6,
                  fill: '#6b1d37',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* شريط الترقيم السفلي */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs md:text-sm text-gray-700">
        <div className="flex items-center gap-1.5" dir="ltr">
          <button
            type="button"
            onClick={() => setActivePage((p) => Math.min(totalPages, p + 1))}
            disabled={activePage >= totalPages}
            aria-label="الصفحة التالية"
            className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:border-brand hover:text-brand disabled:opacity-40 transition-colors cursor-pointer"
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
                className={`w-8 h-8 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${isCurrent
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
            disabled={activePage <= 1}
            aria-label="الصفحة السابقة"
            className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:border-brand hover:text-brand disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="text-gray-700 font-medium">
          عرض {orderRows.length} من {totalOrders || orderRows.length}
        </div>
      </div>

      {selectedOrder && (
        <div className="sr-only" aria-live="polite">
          تم تحديد الطلب {selectedOrder.orderNumber}
        </div>
      )}
    </div>
  );
};

export default Dashboard;