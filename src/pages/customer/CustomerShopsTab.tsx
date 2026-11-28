import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  PauseCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type ShopStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'INACTIVE';

export interface CustomerShopItem {
  id: string | number;
  name: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  status: ShopStatus | string;
  rejectionReason?: string | null;
  productsCount?: number;
  createdAt?: string;
}

interface CustomerShopsTabProps {
  shops?: CustomerShopItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  createShopPath?: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    badgeClass: string;
    icon: React.ElementType;
  }
> = {
  ACTIVE: {
    label: 'نشط',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  APPROVED: {
    label: 'مقبول',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  PENDING: {
    label: 'قيد المراجعة',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  REJECTED: {
    label: 'مرفوض',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
  },
  SUSPENDED: {
    label: 'موقوف',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: PauseCircle,
  },
  INACTIVE: {
    label: 'غير نشط',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: PauseCircle,
  },
};

const getStatusInfo = (status?: string) => {
  const key = (status || 'PENDING').toUpperCase();
  return (
    statusConfig[key] ?? {
      label: status || 'قيد المراجعة',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
    }
  );
};

const CustomerShopsTab: React.FC<CustomerShopsTabProps> = ({
  shops = [],
  isLoading = false,
  onRefresh,
  createShopPath = '/customer/shops/create',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const goToCreateShop = () => {
    navigate(createShopPath);
  };

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const normalizedStatus = (shop.status || '').toUpperCase();
      const matchesStatus =
        statusFilter === 'ALL' || normalizedStatus === statusFilter;

      const q = searchTerm.trim().toLowerCase();
      const matchesQuery =
        !q ||
        shop.name.toLowerCase().includes(q) ||
        (shop.description || '').toLowerCase().includes(q) ||
        (shop.address || '').toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [shops, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  // الحالة الفارغة: لا توجد متاجر مرتبطة بالحساب
  if (shops.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-4 py-10 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
          <Store className="w-8 h-8" />
        </div>

        <div className="max-w-md space-y-1.5">
          <h2 className="text-lg sm:text-xl font-bold text-brand-ink">
            لا توجد لديك متاجر حتى الآن
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            {user?.name ? `أهلاً ${user.name}، ` : ''}
            يمكنك الانضمام إلى المنصة وإنشاء متجرك الخاص لعرض منتجاتك وإدارة
            طلباتك وعروضك بكل سهولة.
          </p>
        </div>

        <button
          type="button"
          onClick={goToCreateShop}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark text-surface text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>انضمام للمتجر</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس القسم وأزرار الإجراء */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-brand-ink">
            متاجري ({shops.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            متابعة جميع متاجرك وحالات الموافقة والتشغيل الخاصة بها
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-brand text-xs font-semibold text-gray-700 hover:text-brand transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث</span>
            </button>
          )}

          <button
            type="button"
            onClick={goToCreateShop}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-surface text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>انضمام للمتجر</span>
          </button>
        </div>
      </div>

      {/* البحث وفلترة الحالات */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم المتجر أو الوصف..."
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-200 bg-surface text-xs sm:text-sm text-brand-ink placeholder-gray-400 focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { key: 'ALL', label: 'الكل' },
            { key: 'ACTIVE', label: 'نشط' },
            { key: 'PENDING', label: 'قيد المراجعة' },
            { key: 'REJECTED', label: 'مرفوض' },
            { key: 'SUSPENDED', label: 'موقوف' },
          ].map((item) => {
            const active = statusFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setStatusFilter(item.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-brand text-surface border-brand'
                    : 'bg-surface text-gray-600 border-gray-200 hover:border-brand'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* شبكة عرض المتاجر */}
      {filteredShops.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            لا توجد متاجر مطابقة للبحث أو الحالة المختارة
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
            }}
            className="text-xs font-bold text-brand hover:underline cursor-pointer"
          >
            إعادة ضبط الفلتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredShops.map((shop) => {
            const status = getStatusInfo(shop.status);
            const StatusIcon = status.icon;

            return (
              <article
                key={String(shop.id)}
                className="rounded-2xl border border-brand-neutral/80 bg-surface hover:border-brand/40 transition-all overflow-hidden flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* غلاف وشعار المتجر */}
                  <div className="relative h-28 bg-gradient-to-l from-brand/15 to-brand-neutral/40">
                    {shop.coverImage && (
                      <img
                        src={shop.coverImage}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    )}

                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold shadow-2xs ${status.badgeClass}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{status.label}</span>
                      </span>
                    </div>

                    <div className="absolute -bottom-6 right-4">
                      {shop.logo ? (
                        <img
                          src={shop.logo}
                          alt={shop.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-surface bg-surface shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-brand text-surface border-2 border-surface shadow-sm flex items-center justify-center font-bold text-lg">
                          {shop.name.trim().charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* تفاصيل المتجر */}
                  <div className="pt-8 px-4 pb-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-brand-ink truncate">
                        {shop.name}
                      </h3>
                      {shop.productsCount !== undefined && (
                        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                          {shop.productsCount} منتج
                        </span>
                      )}
                    </div>

                    {shop.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {shop.description}
                      </p>
                    )}

                    <div className="pt-1 space-y-1 text-xs text-gray-500">
                      {shop.address && (
                        <p className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span>{shop.address}</span>
                        </p>
                      )}
                      {shop.phone && (
                        <p
                          className="flex items-center gap-1.5 text-right"
                          dir="ltr"
                        >
                          <Phone className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span>{shop.phone}</span>
                        </p>
                      )}
                      {shop.email && (
                        <p
                          className="flex items-center gap-1.5 truncate text-right"
                          dir="ltr"
                        >
                          <Mail className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span>{shop.email}</span>
                        </p>
                      )}
                    </div>

                    {shop.rejectionReason && (
                      <div className="mt-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
                        <span className="font-bold">سبب الملاحظة/الرفض: </span>
                        <span>{shop.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* تذييل البطاقة */}
                <div className="px-4 py-3 border-t border-gray-100 bg-brand-neutral/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400" dir="ltr">
                    #{shop.id}
                  </span>

                  <button
                    type="button"
                    onClick={() => navigate(`/shops/${shop.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline cursor-pointer"
                  >
                    <span>عرض المتجر</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerShopsTab;