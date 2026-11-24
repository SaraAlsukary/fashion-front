import React from 'react';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  Package,
  ClipboardList,
  Percent,
  ArrowUpLeft,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useDashboardOverview } from '../../hooks/market/useDashboard';

const Market: React.FC = () => {
  const { data, isLoading, error } = useDashboardOverview();

  const shopName = data?.data?.shop?.name;
  const statsData = data?.data?.statistics;
  const subscription = data?.data?.currentSubscription;
  const recentOrders = data?.data?.recentOrders ?? [];

  const totalSales = Number(statsData?.totalSales ?? 0);
  const totalPaidOrders = Number(statsData?.totalPaidOrders ?? 0);

  const totalOrders = Number(statsData?.totalOrders ?? 0);
  const newOrders = Number(statsData?.newOrders ?? 0);
  const processingOrders = Number(statsData?.processingOrders ?? 0);
  const shippedOrders = Number(statsData?.shippedOrders ?? 0);
  const deliveredOrders = Number(statsData?.deliveredOrders ?? 0);
  const cancelledOrders = Number(statsData?.cancelledOrders ?? 0);

  const totalProducts = Number(statsData?.totalProducts ?? 0);
  const activeProducts = Number(statsData?.activeProducts ?? 0);
  const hiddenProducts = Number(statsData?.hiddenProducts ?? 0);

  const totalReviews = Number(statsData?.totalReviews ?? 0);
  const averageRating = Number(statsData?.averageRating ?? 0);

  const stats = [
    {
      label: 'إجمالي المبيعات',
      value: `${totalSales.toLocaleString()} ل.س.ج`,
      delta: `${totalPaidOrders} طلب مدفوع`,
      icon: TrendingUp,
      to: '/market/orders',
    },
    {
      label: 'إجمالي الطلبات',
      value: `${totalOrders} طلب`,
      delta: `جديد: ${newOrders} • قيد التجهيز: ${processingOrders} • مكتمل: ${deliveredOrders}`,
      icon: ClipboardList,
      to: '/market/orders',
    },
    {
      label: 'المنتجات',
      value: `${totalProducts} منتج`,
      delta: `نشط: ${activeProducts} • مخفي: ${hiddenProducts}`,
      icon: Package,
      to: '/market/products',
    },
    {
      label: 'التقييمات',
      value: totalReviews > 0 ? `${averageRating} / 5` : '0 / 5',
      delta: `${totalReviews} تقييم مسجل`,
      icon: GitBranch,
      to: '/market/branches',
    },
  ];

  // بيانات المخطط الأول: حالة الطلبات والمنتجات بمحاور X و Y
  const overviewChartData = [
    { name: 'جديد', value: newOrders },
    { name: 'قيد التجهيز', value: processingOrders },
    { name: 'مشحون', value: shippedOrders },
    { name: 'مكتمل', value: deliveredOrders },
    { name: 'ملغي', value: cancelledOrders },
    { name: 'منتجات نشطة', value: activeProducts },
    { name: 'منتجات مخفية', value: hiddenProducts },
  ];

  // بيانات المخطط الثاني: قيم الطلبات الحديثة (أو المبيعات) بمحاور X و Y
  const ordersSalesChartData =
    recentOrders.length > 0
      ? recentOrders.map((order) => ({
          name: order.order_number,
          value: Number(order.total ?? 0),
        }))
      : [{ name: 'إجمالي المبيعات', value: totalSales }];

  // بيانات المخطط الخطي الثالث: مسار حالات الطلبات والتقييمات بمحاور X و Y
  const ordersAndReviewsTrendData = [
    {
      stage: 'جديد',
      ordersCount: newOrders,
      reviewsCount: 0,
      avgRating: averageRating,
    },
    {
      stage: 'قيد التجهيز',
      ordersCount: processingOrders,
      reviewsCount: 0,
      avgRating: averageRating,
    },
    {
      stage: 'مشحون',
      ordersCount: shippedOrders,
      reviewsCount: 0,
      avgRating: averageRating,
    },
    {
      stage: 'مكتمل',
      ordersCount: deliveredOrders,
      reviewsCount: totalReviews,
      avgRating: averageRating,
    },
    {
      stage: 'ملغي',
      ordersCount: cancelledOrders,
      reviewsCount: 0,
      avgRating: averageRating,
    },
  ];

  const quickActions = [
    {
      title: 'إدارة الفروع',
      desc: 'إضافة وتعديل الفروع ومواعيد العمل والعناوين',
      to: '/market/branches',
      icon: GitBranch,
    },
    {
      title: 'إدارة المنتجات',
      desc: 'إضافة منتجات جديدة وتحديد المقاسات والألوان والصور',
      to: '/market/products',
      icon: Package,
    },
    {
      title: 'متابعة الطلبات',
      desc: 'مراجعة تفاصيل الطلبات ومعلومات الشحن وإكمال الطلب',
      to: '/market/orders',
      icon: ClipboardList,
    },
    {
      title: 'العروض والخصومات',
      desc: 'إنشاء عروض نسبة مئوية أو قيمة ثابتة على المنتجات',
      to: '/market/offers',
      icon: Percent,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">
            {shopName ? `لوحة تحكم المتجر — ${shopName}` : 'لوحة تحكم المتجر'}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            الرئيسية &lt; نظرة عامة على المتجر
          </p>
        </div>

        {subscription?.plan?.name && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-soft text-brand text-xs font-semibold">
            <span>الباقة الحالية: {subscription.plan.name}</span>
            <span>({subscription.status})</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-xs md:text-sm">
          {error.message}
        </div>
      )}

      {/* بطاقات المؤشرات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl border border-gray-200 bg-gray-100/70 animate-pulse"
              />
            ))
          : stats.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className="bg-surface border border-gray-200 hover:border-brand rounded-2xl p-4 space-y-2 transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      {item.label}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-base md:text-lg font-bold text-gray-900">
                    {item.value}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {item.delta}
                  </p>
                </Link>
              );
            })}
      </div>

      {/* الرسوم البيانية بمحاور X و Y */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* مخطط توزيع الطلبات والمنتجات */}
        <div className="bg-surface border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-base font-bold text-gray-900">
              توزيع الطلبات والمنتجات
            </h2>
            <span className="text-[11px] text-gray-500">العدد</span>
          </div>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overviewChartData}
                margin={{ top: 10, right: 12, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#4b5563' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#4b5563' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: number) => [`${val}`, 'القيمة'] }
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* مخطط قيمة المبيعات / الطلبات */}
        <div className="bg-surface border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-base font-bold text-gray-900">
              قيمة الطلبات والمبيعات
            </h2>
            <span className="text-[11px] text-gray-500">ل.س.ج</span>
          </div>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ordersSalesChartData}
                margin={{ top: 10, right: 12, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#4b5563' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#4b5563' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: number) => [
                    `${Number(val).toLocaleString()} ل.س.ج`,
                    'القيمة',
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* مخطط خطي إضافي: حالات الطلبات والتقييمات بمحاور X و Y */}
        <div className="lg:col-span-2 bg-surface border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm md:text-base font-bold text-gray-900">
              مؤشر حالات الطلبات والتقييمات
            </h2>
            <span className="text-[11px] text-gray-500">
              متوسط التقييم: {averageRating} / 5 ({totalReviews} تقييم)
            </span>
          </div>

          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ordersAndReviewsTrendData}
                margin={{ top: 10, right: 16, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 11, fill: '#4b5563' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#4b5563' }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="ordersCount"
                  name="عدد الطلبات"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="reviewsCount"
                  name="عدد التقييمات"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgRating"
                  name="متوسط التقييم (من 5)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* أحدث الطلبات */}
      {recentOrders.length > 0 && (
        <div className="bg-surface border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-base font-bold text-gray-900">
              أحدث الطلبات
            </h2>
            <Link
              to="/market/orders"
              className="text-xs font-semibold text-brand hover:underline"
            >
              عرض الكل
            </Link>
          </div>

          <div className="divide-y divide-gray-100 text-xs md:text-sm">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="py-2.5 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="font-semibold text-gray-900">
                  {order.order_number}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                    {order.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
                    {order.payment_status}
                  </span>
                </div>
                <div className="font-bold text-gray-900">
                  {Number(order.total).toLocaleString()} ل.س.ج
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* الوصول السريع */}
      <div className="space-y-3">
        <h2 className="text-sm md:text-base font-bold text-gray-900">
          الأقسام الرئيسية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="group bg-surface border border-gray-200 hover:border-brand rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand group-hover:bg-brand group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-gray-900">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                </div>
                <ArrowUpLeft className="w-5 h-5 text-gray-400 group-hover:text-brand shrink-0 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Market;