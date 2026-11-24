import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Check,
  CreditCard,
  Calendar,
  Sparkles,
  History,
} from 'lucide-react';
import {
  useCurrentSubscription,
  useRequestSubscription,
  useSubscriptionHistory,
  useSubscriptionPlans,
} from '../../hooks/market/useSubscriptions';
import type { SubscriptionPlanApi } from '../../services/market/subscriptionsService';

const formatDate = (raw?: string): string => {
  if (!raw) return '-';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDuration = (duration: number, unit?: string): string => {
  const normalizedUnit = (unit || 'MONTH').toUpperCase();
  if (normalizedUnit === 'MONTH') {
    return duration === 1 ? 'شهر واحد' : `${duration} أشهر`;
  }
  if (normalizedUnit === 'YEAR') {
    return duration === 1 ? 'سنة واحدة' : `${duration} سنوات`;
  }
  if (normalizedUnit === 'DAY') {
    return duration === 1 ? 'يوم واحد' : `${duration} أيام`;
  }
  return `${duration} ${normalizedUnit}`;
};

const statusBadgeMap: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  EXPIRED: 'bg-rose-50 text-rose-700 border-rose-200',
  CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
};

const statusLabelMap: Record<string, string> = {
  ACTIVE: 'نشط',
  PENDING: 'قيد الانتظار',
  EXPIRED: 'منتهي',
  CANCELLED: 'ملغي',
};

const MarketSubscriptions: React.FC = () => {
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [requestingPlanId, setRequestingPlanId] = useState<string | null>(null);

  const {
    data: currentRes,
    isLoading: isLoadingCurrent,
    error: currentError,
  } = useCurrentSubscription();

  const {
    data: plansRes,
    isLoading: isLoadingPlans,
    error: plansError,
  } = useSubscriptionPlans();

  const {
    data: historyRes,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useSubscriptionHistory({ page: historyPage, limit: 10 });

  const requestSubMutation = useRequestSubscription();

  const currentSub = currentRes?.data ?? null;
  const plans = plansRes?.data ?? [];
  const historyRows = historyRes?.data ?? [];
  const historyMeta = historyRes?.meta;

  const handleRequestPlan = async (plan: SubscriptionPlanApi) => {
    setRequestingPlanId(String(plan.id));
    try {
      const res = await requestSubMutation.mutateAsync({
        planId: String(plan.id),
      });
      toast.success(
        res?.message || `تم إرسال طلب الاشتراك في "${plan.name}" بنجاح`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'فشل إرسال طلب الاشتراك'
      );
    } finally {
      setRequestingPlanId(null);
    }
  };

  const pageError = currentError || plansError || historyError;

  return (
    <div className="space-y-6">
      {/* العنوان والمسار */}
      <div>
        <h1 className="text-lg md:text-xl font-bold text-gray-900">
          الاشتراكات والباقات
        </h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          الرئيسية &lt; الاشتراكات
        </p>
      </div>

      {pageError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-xs md:text-sm">
          {pageError.message}
        </div>
      )}

      {/* بطاقة الاشتراك الحالي */}
      <div className="bg-surface border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand" />
            <h2 className="text-sm md:text-base font-bold text-gray-900">
              الاشتراك الحالي
            </h2>
          </div>

          {currentSub?.status && (
            <span
              className={`px-3 py-0.5 rounded-full border text-xs font-semibold ${
                statusBadgeMap[currentSub.status.toUpperCase()] ??
                'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {statusLabelMap[currentSub.status.toUpperCase()] ??
                currentSub.status}
            </span>
          )}
        </div>

        {isLoadingCurrent ? (
          <div className="h-24 rounded-xl bg-gray-100/70 animate-pulse" />
        ) : !currentSub ? (
          <p className="text-xs md:text-sm text-gray-500 py-3">
            لا يوجد اشتراك نشط حالياً. يمكنك اختيار باقة من الباقات المتاحة
            بالأسفل.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">الباقة</p>
              <p className="font-bold text-gray-900 text-sm md:text-base">
                {currentSub.plan?.name || `باقة #${currentSub.plan_id}`}
              </p>
              {currentSub.plan?.description && (
                <p className="text-xs text-gray-600">
                  {currentSub.plan.description}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand" />
                <span>فترة الاشتراك</span>
              </p>
              <p className="font-semibold text-gray-800">
                من {formatDate(currentSub.start_at ?? currentSub.startAt)} إلى{' '}
                {formatDate(currentSub.end_at ?? currentSub.endAt)}
              </p>
              {currentSub.plan && (
                <p className="text-xs text-gray-500">
                  المدة:{' '}
                  {formatDuration(
                    currentSub.plan.duration,
                    currentSub.plan.duration_unit ??
                      currentSub.plan.durationUnit
                  )}
                </p>
              )}
            </div>

            <div className="space-y-1 md:text-left">
              <p className="text-xs text-gray-500">قيمة الاشتراك</p>
              <p className="font-bold text-gray-900 text-sm md:text-base">
                {Number(currentSub.price ?? 0).toLocaleString()} ل.س.ج
              </p>
              {currentSub.plan?.features &&
                currentSub.plan.features.length > 0 && (
                  <div className="flex flex-wrap md:justify-end gap-1.5 pt-1">
                    {currentSub.plan.features.map((feat) => (
                      <span
                        key={feat}
                        className="px-2 py-0.5 rounded-md bg-brand-soft text-brand text-[11px] font-medium"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* الباقات المتاحة */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" />
          <h2 className="text-sm md:text-base font-bold text-gray-900">
            الباقات المتاحة
          </h2>
        </div>

        {isLoadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-52 rounded-2xl border border-gray-200 bg-gray-100/70 animate-pulse"
              />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-surface border border-gray-200 rounded-2xl p-6 text-center text-xs text-gray-500">
            لا توجد باقات متاحة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const planIdStr = String(plan.id);
              const isCurrentPlan =
                currentSub &&
                String(currentSub.plan_id ?? currentSub.plan?.id ?? '') ===
                  planIdStr &&
                (currentSub.status || '').toUpperCase() === 'ACTIVE';
              const isSubmittingThis = requestingPlanId === planIdStr;

              return (
                <div
                  key={planIdStr}
                  className={`bg-surface rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all ${
                    isCurrentPlan
                      ? 'border-brand ring-1 ring-brand/20'
                      : 'border-gray-200 hover:border-brand/60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {plan.name}
                        </h3>
                        {plan.description && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {plan.description}
                          </p>
                        )}
                      </div>

                      {isCurrentPlan && (
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-soft text-brand text-[11px] font-semibold shrink-0">
                          الباقة الحالية
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-xl font-bold text-gray-900">
                        {Number(plan.price ?? 0).toLocaleString()} ل.س.ج
                      </span>
                      <span className="text-xs text-gray-500">
                        / {formatDuration(plan.duration, plan.duration_unit ?? plan.durationUnit)}
                      </span>
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-700">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isSubmittingThis || requestSubMutation.isPending}
                    onClick={() => handleRequestPlan(plan)}
                    className={`w-full py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
                      isCurrentPlan
                        ? 'bg-brand-soft text-brand hover:bg-brand/20'
                        : 'bg-brand hover:bg-brand-dark text-white'
                    }`}
                  >
                    {isSubmittingThis
                      ? 'جاري إرسال الطلب...'
                      : isCurrentPlan
                        ? 'تجديد / طلب هذه الباقة'
                        : 'طلب الاشتراك'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* سجل الاشتراكات */}
      <div className="bg-surface border border-gray-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand" />
            <h2 className="text-sm md:text-base font-bold text-gray-900">
              سجل الاشتراكات ({historyMeta?.total ?? historyRows.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-xs font-semibold">
                <th className="py-2.5 px-3">الحالة</th>
                <th className="py-2.5 px-3">السعر</th>
                <th className="py-2.5 px-3">تاريخ الانتهاء</th>
                <th className="py-2.5 px-3">تاريخ البدء</th>
                <th className="py-2.5 px-3">الباقة</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs md:text-sm text-gray-700">
              {isLoadingHistory ? (
                <tr>
                  <td colSpan={5} className="py-6 text-gray-500">
                    جاري تحميل السجل...
                  </td>
                </tr>
              ) : historyRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-gray-500">
                    لا يوجد سجل اشتراكات سابق.
                  </td>
                </tr>
              ) : (
                historyRows.map((item) => {
                  const st = (item.status || '').toUpperCase();
                  return (
                    <tr key={item.id} className="hover:bg-surface-muted/50">
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                            statusBadgeMap[st] ??
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {statusLabelMap[st] ?? item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900">
                        {Number(item.price ?? 0).toLocaleString()} ل.س.ج
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {formatDate(item.end_at ?? item.endAt)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {formatDate(item.start_at ?? item.startAt)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">
                        {item.plan?.name || `باقة #${item.plan_id}`}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {historyMeta && historyMeta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              disabled={historyPage <= 1}
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 cursor-pointer"
            >
              السابق
            </button>
            <span className="text-gray-600">
              صفحة {historyMeta.page} من {historyMeta.totalPages}
            </span>
            <button
              type="button"
              disabled={historyPage >= historyMeta.totalPages}
              onClick={() => setHistoryPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 cursor-pointer"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketSubscriptions;