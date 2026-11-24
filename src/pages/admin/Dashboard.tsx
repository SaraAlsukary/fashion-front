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

type OrderStatus = 'قيد المعالجة' | 'تم الشحن' | 'معلق';

interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  comparison: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface OrderRow {
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

const initialStats: StatCard[] = [
  {
    id: 'users',
    title: 'اجمالي المستخدمين',
    value: '12 مستخدم',
    change: '+3مستخدمين ↑',
    comparison: 'مقارنة بالشهر الماضي',
    icon: Users,
  },
  {
    id: 'markets',
    title: 'اجمالي المتاجر',
    value: '24 متجر',
    change: '+5 متاجر ↑',
    comparison: 'مقارنة بالشهر الماضي',
    icon: Store,
  },
  {
    id: 'orders',
    title: 'اجمالي الطلبات',
    value: '200طلب',
    change: '+65 طلب ↑',
    comparison: 'مقارنة بالشهر الماضي',
    icon: ClipboardList,
  },
  {
    id: 'profit',
    title: 'اجمالي الربح',
    value: '12000 ل.س.ج',
    change: '+6% ↑',
    comparison: 'مقارنة بالشهر الماضي',
    icon: CircleDollarSign,
  },
  {
    id: 'subscriptions',
    title: 'اجمالي الاشتراكات',
    value: '50 اشتراك',
    change: '+6% ↑',
    comparison: 'مقارنة بالشهر الماضي',
    icon: BadgePercent,
  },
  {
    id: 'pending-markets',
    title: 'المتاجر قيد الانتظار',
    value: '12 متجر',
    change: '+3متاجر ↑',
    comparison: 'مقارنة بالشهر الماضي',
    icon: Store,
  },
];

const initialOrders: OrderRow[] = [
  {
    id: '1',
    orderNumber: '#ord1001',
    customerName: 'محمد محمد',
    status: 'قيد المعالجة',
    amount: '5000ل.س.ج',
    date: '22/12/2026',
  },
  {
    id: '2',
    orderNumber: '#ord1001',
    customerName: 'محمد محمد',
    status: 'تم الشحن',
    amount: '5000ل.س.ج',
    date: '22/12/2026',
  },
  {
    id: '3',
    orderNumber: '#ord1001',
    customerName: 'محمد محمد',
    status: 'معلق',
    amount: '5000ل.س.ج',
    date: '22/12/2026',
  },
];

const weeklySalesData: SalesPoint[] = [
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

interface DashboardProps {
  onViewOrder?: (order: OrderRow) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewOrder }) => {
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  const pages = useMemo(() => [1, 2, 3, 10], []);

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
      <div>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          نظرة عامة عن المتجر
        </p>
      </div>

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
          {initialStats.map((stat) => {
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
                  {stat.value}
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
              {initialOrders.map((order) => (
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
                      className={`inline-block px-3.5 py-1 rounded-md text-xs font-semibold ${
                        statusBadgeStyle[order.status]
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
              ))}
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
              data={weeklySalesData}
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
                ticks={[200, 400, 550, 1000, 1250]}
                domain={[150, 1700]}
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
            onClick={() => setActivePage((p) => Math.min(10, p + 1))}
            aria-label="الصفحة التالية"
            className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:border-brand hover:text-brand transition-colors cursor-pointer"
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
            className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:border-brand hover:text-brand transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="text-gray-700 font-medium">عرض 1 من 17</div>
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