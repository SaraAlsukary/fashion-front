import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Phone,
  MapPin,
  User,
  PackageOpen,
  Search,
} from 'lucide-react';
import {
  useOrdersList,
  useUpdateOrderStatus,
} from '../../hooks/market/useOrders';
import {
  resolveMediaUrl,
  type OrderApi,
} from '../../services/market/ordersService';

type OrderTabKey =
  | 'ALL'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

const TABS: { key: OrderTabKey; label: string; apiStatus?: string }[] = [
  { key: 'ALL', label: 'الكل' },
  { key: 'PENDING', label: 'الجديدة', apiStatus: 'PENDING' },
  { key: 'PROCESSING', label: 'قيد المعالجة', apiStatus: 'PROCESSING' },
  { key: 'SHIPPED', label: 'تم الشحن', apiStatus: 'SHIPPED' },
  { key: 'DELIVERED', label: 'تم التوصيل', apiStatus: 'DELIVERED' },
  { key: 'CANCELLED', label: 'تم الإلغاء', apiStatus: 'CANCELLED' },
];

const formatOrderDate = (raw?: string): string => {
  if (!raw) return '-';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatAddress = (addr: OrderApi['shipping_address'] | OrderApi['address']): string => {
  if (!addr) return 'غير محدد';
  if (typeof addr === 'string') return addr;
  if (addr.fullAddress) return addr.fullAddress;
  if (addr.address) return addr.address;
  return [addr.city, addr.area, addr.street].filter(Boolean).join('، ') || 'غير محدد';
};

const statusLabelMap: Record<string, string> = {
  PENDING: 'جديد',
  CONFIRMED: 'مؤكد',
  PROCESSING: 'قيد المعالجة',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغي',
};

const MarketOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrderTabKey>('ALL');
  const [orderNumberQuery, setOrderNumberQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedId, setSelectedId] = useState<string>('');

  const selectedTabConfig = useMemo(
    () => TABS.find((t) => t.key === activeTab) ?? TABS[0],
    [activeTab]
  );

  const { data, isLoading, error } = useOrdersList({
    page,
    limit: 10,
    status: selectedTabConfig.apiStatus,
    orderNumber: orderNumberQuery || undefined,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const orders = data?.data ?? [];
  const meta = data?.meta;

  useEffect(() => {
    if (orders.length === 0) {
      setSelectedId('');
      return;
    }
    const exists = orders.some((o) => String(o.id) === selectedId);
    if (!exists) {
      setSelectedId(String(orders[0].id));
    }
  }, [orders, selectedId]);

  const activeOrder = useMemo(
    () => orders.find((o) => String(o.id) === selectedId) ?? orders[0],
    [orders, selectedId]
  );

  const getOrderItems = (order: OrderApi) => {
    const rawItems = order.items ?? order.order_items ?? order.orderItems ?? [];
    return rawItems.map((item, idx) => {
      const title =
        item.title ||
        item.product_name ||
        item.productName ||
        item.product?.name ||
        item.product?.title ||
        `منتج #${idx + 1}`;

      const rawPrice = item.price ?? item.unit_price ?? 0;
      const priceText = `${Number(rawPrice).toLocaleString()} ل.س.ج`;

      const sizeText =
        typeof item.size === 'string'
          ? item.size
          : item.size?.name || '-';

      const rawImg =
        item.imageUrl ||
        item.image ||
        item.product?.image ||
        item.product?.images?.[0]?.image ||
        item.product?.images?.[0]?.url;

      return {
        id: item.id ?? String(idx),
        title,
        priceText,
        quantity: Number(item.quantity ?? 1),
        sizeText,
        imageUrl: resolveMediaUrl(rawImg),
      };
    });
  };

  const handleCompleteOrder = async (order: OrderApi) => {
    const currentStatus = (order.status || '').toUpperCase();
    const nextStatus =
      currentStatus === 'PENDING' || currentStatus === 'CONFIRMED'
        ? 'PROCESSING'
        : currentStatus === 'PROCESSING'
          ? 'SHIPPED'
          : 'DELIVERED';

    try {
      await updateStatusMutation.mutateAsync({
        orderId: String(order.id),
        status: nextStatus,
      });
      toast.success(
        `تم تحديث حالة الطلب إلى "${statusLabelMap[nextStatus] ?? nextStatus}"`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'فشل تحديث حالة الطلب'
      );
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">الطلبات</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            الرئيسية &lt; الطلبات
          </p>
        </div>

        {/* بحث برقم الطلب */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={orderNumberQuery}
            onChange={(e) => {
              setOrderNumberQuery(e.target.value);
              setPage(1);
            }}
            placeholder="بحث برقم الطلب..."
            className="w-full pr-9 pl-3 py-1.5 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* تبويبات الحالات */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors cursor-pointer ${activeTab === tab.key
              ? 'bg-brand text-white'
              : 'bg-brand-soft text-brand hover:bg-brand/20'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-xs md:text-sm">
          {error.message}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-5 space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl border border-gray-200 bg-gray-100/70 animate-pulse"
              />
            ))}
          </div>
          <div className="xl:col-span-7 h-80 rounded-2xl border border-gray-200 bg-gray-100/70 animate-pulse" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-surface border border-gray-200 rounded-2xl p-10 text-center space-y-2">
          <PackageOpen className="w-10 h-10 text-gray-400 mx-auto" />
          <p className="text-sm font-bold text-gray-900">
            لا توجد طلبات متاحة حالياً
          </p>
          <p className="text-xs text-gray-500">
            {meta
              ? `إجمالي الطلبات: ${meta.total} — الصفحة ${meta.page} من ${meta.totalPages}`
              : 'ستظهر الطلبات الجديدة هنا فور وصولها إلى المتجر.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* قائمة الطلبات */}
          <div className="xl:col-span-5 space-y-3">
            {orders.map((order) => {
              const orderId = String(order.id);
              const isSelected = activeOrder && String(activeOrder.id) === orderId;
              const numberText =
                order.order_number || order.orderNumber || `#${orderId}`;
              const totalNum = Number(order.total ?? order.amount ?? 0);
              const items = getOrderItems(order);
              const statusCode = (order.status || '').toUpperCase();

              return (
                <button
                  key={orderId}
                  type="button"
                  onClick={() => setSelectedId(orderId)}
                  className={`w-full text-right p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${isSelected
                    ? 'bg-surface border-brand shadow-xs'
                    : 'bg-surface border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900">
                      {numberText}
                    </p>
                    <p className="text-xs font-medium text-gray-700">
                      {totalNum.toLocaleString()} ل.س.ج
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatOrderDate(order.created_at ?? order.createdAt ?? order.date)}
                    </p>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-md bg-brand-soft text-brand text-[11px] font-semibold">
                      {statusLabelMap[statusCode] ?? order.status ?? 'غير محدد'}
                    </span>
                  </div>

                  {items[0]?.imageUrl && (
                    <img
                      crossOrigin="anonymous"
                      src={items[0].imageUrl}
                      alt={numberText}
                      className="w-16 h-20 rounded-xl object-cover shrink-0 border border-gray-200"
                    />
                  )}
                </button>
              );
            })}

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 cursor-pointer"
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
                  className="px-3 py-1.5 rounded-lg border border-gray-300 disabled:opacity-50 cursor-pointer"
                >
                  التالي
                </button>
              </div>
            )}
          </div>

          {/* تفاصيل الطلب المحدد */}
          {activeOrder && (() => {
            const orderNumText =
              activeOrder.order_number ||
              activeOrder.orderNumber ||
              `#${activeOrder.id}`;
            const totalNum = Number(activeOrder.total ?? activeOrder.amount ?? 0);
            const customerName =
              activeOrder.customerName ||
              activeOrder.customer_name ||
              activeOrder.customer?.fullName ||
              activeOrder.customer?.name ||
              'عميل المتجر';
            const phoneText =
              activeOrder.phone ||
              activeOrder.shipping_phone ||
              activeOrder.customer?.phone ||
              '-';
            const addressText = formatAddress(
              activeOrder.shipping_address ?? activeOrder.address
            );
            const items = getOrderItems(activeOrder);

            return (
              <div className="xl:col-span-7 bg-surface border border-gray-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      تفاصيل الطلب — {orderNumText}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatOrderDate(
                        activeOrder.created_at ??
                        activeOrder.createdAt ??
                        activeOrder.date
                      )}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">المبلغ النهائي</p>
                    <p className="text-sm font-bold text-gray-900">
                      {totalNum.toLocaleString()} ل.س.ج
                    </p>
                  </div>
                </div>

                {/* معلومات الشحن */}
                <div className="space-y-1.5 text-xs text-gray-700 bg-surface-muted/60 rounded-xl p-3.5">
                  <p className="font-bold text-gray-900">معلومات الشحن</p>
                  <p className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand" />
                    <span>{customerName}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand" />
                    <span dir="ltr">{phoneText}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand" />
                    <span>{addressText}</span>
                  </p>
                </div>

                {/* المنتجات المطلوبة */}
                {items.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-gray-900">
                      المنتجات المطلوبة
                    </p>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 text-xs text-gray-700">
                          <p className="text-sm font-bold text-gray-900">
                            {item.title}
                          </p>
                          <p>السعر : {item.priceText}</p>
                          <p>الكمية : {item.quantity}</p>
                          <p>المقاس : {item.sizeText}</p>
                        </div>
                        {item.imageUrl && (
                          <img
                            crossOrigin="anonymous"
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-16 h-20 rounded-lg object-cover shrink-0"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  disabled={updateStatusMutation.isPending}
                  onClick={() => handleCompleteOrder(activeOrder)}
                  className="w-full py-2.5 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {updateStatusMutation.isPending
                      ? 'جاري تحديث الحالة...'
                      : 'تحديث حالة الطلب'}
                  </span>
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default MarketOrders;