import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  BadgeCheck,
  Clock,
  RefreshCw,
  Store,
  KeyRound,
  Hash,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const formatArabicDate = (raw?: string | null): string => {
  if (!raw) return 'غير موثق بعد';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const roleLabels: Record<string, string> = {
  CUSTOMER: 'زبون',
  VENDOR: 'صاحب متجر',
  ADMIN: 'مدير النظام',
};

const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: 'نشط',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  INACTIVE: {
    label: 'غير نشط',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  SUSPENDED: {
    label: 'موقوف',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const CustomerProfileInfo: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, refetchUser } = useAuth();

  if (isLoading && !user) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-7 w-44 rounded-lg bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm font-semibold text-gray-700">
          تعذر تحميل بيانات الحساب حالياً
        </p>
        <button
          type="button"
          onClick={refetchUser}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-surface text-xs font-semibold hover:bg-brand-dark transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  const currentStatus =
    statusLabels[(user.status || 'ACTIVE').toUpperCase()] ?? statusLabels.ACTIVE;
  const isVerified = Boolean(user.email_verified_at);

  return (
    <div className="space-y-6">
      {/* رأس القسم */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-base md:text-lg font-bold text-brand-ink">
            معلومات الحساب الشخصية
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            عرض بياناتك الأساسية وحالة توثيق الحساب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={refetchUser}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-brand text-xs font-semibold text-gray-700 hover:text-brand disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث البيانات</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/customer/settings')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand text-surface text-xs font-semibold hover:bg-brand-dark transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>تغيير كلمة المرور</span>
          </button>
        </div>
      </div>

      {/* شبكة بطاقات المعلومات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* الاسم الكامل */}
        <div className="rounded-xl border border-brand-neutral/70 bg-brand-neutral/15 p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">الاسم الكامل</p>
            <p className="text-sm font-bold text-brand-ink mt-0.5 truncate">
              {user.name || '—'}
            </p>
          </div>
        </div>

        {/* البريد الإلكتروني وحالة التوثيق */}
        <div className="rounded-xl border border-brand-neutral/70 bg-brand-neutral/15 p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-500">البريد الإلكتروني</p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isVerified
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {isVerified ? (
                  <>
                    <BadgeCheck className="w-3 h-3" />
                    <span>موثق</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>غير موثق</span>
                  </>
                )}
              </span>
            </div>
            <p
              className="text-sm font-bold text-brand-ink mt-0.5 truncate text-right"
              dir="ltr"
            >
              {user.email || '—'}
            </p>
          </div>
        </div>

        {/* رقم الهاتف */}
        <div className="rounded-xl border border-brand-neutral/70 bg-brand-neutral/15 p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">رقم الهاتف</p>
            <p
              className="text-sm font-bold text-brand-ink mt-0.5 text-right"
              dir="ltr"
            >
              {user.phone || 'غير مضاف'}
            </p>
          </div>
        </div>

        {/* نوع الحساب والحالة */}
        <div className="rounded-xl border border-brand-neutral/70 bg-brand-neutral/15 p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">نوع الحساب والحالة</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm font-bold text-brand-ink">
                {roleLabels[(user.role || '').toUpperCase()] ?? user.role ?? 'زبون'}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${currentStatus.className}`}
              >
                {currentStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* تاريخ توثيق البريد */}
        <div className="rounded-xl border border-brand-neutral/70 bg-brand-neutral/15 p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <BadgeCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">تاريخ توثيق البريد الإلكتروني</p>
            <p className="text-xs md:text-sm font-semibold text-brand-ink mt-1">
              {formatArabicDate(user.email_verified_at)}
            </p>
          </div>
        </div>

        {/* رقم المعرف */}
        <div className="rounded-xl border border-brand-neutral/70 bg-brand-neutral/15 p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Hash className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">معرف المستخدم</p>
            <p className="text-sm font-bold text-brand-ink mt-0.5" dir="ltr">
              #{user.id ?? '—'}
            </p>
          </div>
        </div>
      </div>

      {/* بطاقة ترقية الحساب / طلب فتح متجر */}
      {user.role?.toUpperCase() === 'CUSTOMER' && (
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand text-surface flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-ink">
                هل ترغب بفتح متجرك الخاص على المنصة؟
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                يمكنك إرسال طلب إنشاء متجر وإدارة منتجاتك وفروعك مباشرة من حسابك.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/customer/shops')}
            className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-surface text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            إدارة / طلب متجر
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerProfileInfo;