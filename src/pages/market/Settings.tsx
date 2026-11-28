import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ClipboardList,
  Bell,
  Store,
  Tag,
  FileText,
  ChevronDown,
  LogOut,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMyShop, useUpdateMyShop } from '../../hooks/market/useShopSettings';

export interface MarketSettingsFormData {
  storeName: string;
  description: string;
  subscriptionDate: string;
  mainAddress: string;
  subAddress: string;
  phone: string;
  email: string;
  logo?: File | string;
  coverImage?: File | string;
  currentPlan: string;
  startDate: string;
  endDate: string;
  subscriptionStatus: string;
  logoText?: string;
}

interface MarketSettingsProps {
  initialData?: Partial<MarketSettingsFormData>;
  subAddresses?: string[];
  onSaveSubscription?: (data: MarketSettingsFormData) => void;
  onPlansClick?: () => void;
  onGeneralItemClick?: (
    key: 'orders' | 'notifications' | 'markets' | 'brands'
  ) => void;
  onLogoutClick?: () => void;
}

const formatDisplayDate = (
  iso?: string | null,
  fallback = '22/11/2026'
): string => {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const MAX_IMAGE_SIZE_MB = 5;

const MarketSettings: React.FC<MarketSettingsProps> = ({
  initialData,
  subAddresses = ['حلب الفرقان', 'حلب الشهباء', 'دمشق المزة'],
  onSaveSubscription,
  onPlansClick,
  onGeneralItemClick,
  onLogoutClick,
}) => {
  const { logout } = useAuth();
  const { data: shopRes, isLoading: isLoadingShop } = useMyShop();
  const updateShopMutation = useUpdateMyShop();

  const shop = shopRes?.data;

  const [storeName, setStoreName] = useState(
    initialData?.storeName ?? 'Aurelia Studio'
  );
  const [description, setDescription] = useState(
    initialData?.description ?? ''
  );
  const [subscriptionDate, setSubscriptionDate] = useState(
    initialData?.subscriptionDate ?? '22/11/2026'
  );
  const [mainAddress, setMainAddress] = useState(
    initialData?.mainAddress ?? 'حلب الفرقان'
  );
  const [subAddress, setSubAddress] = useState(
    initialData?.subAddress ?? subAddresses[0] ?? 'حلب الفرقان'
  );
  const [phone, setPhone] = useState(initialData?.phone ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');

  // ملفات الصور المختارة من الجهاز + روابط المعاينة
  const [logoFile, setLogoFile] = useState<File | null>(
    initialData?.logo instanceof File ? initialData.logo : null
  );
  const [coverFile, setCoverFile] = useState<File | null>(
    initialData?.coverImage instanceof File ? initialData.coverImage : null
  );
  const [existingLogoUrl, setExistingLogoUrl] = useState<string>(
    typeof initialData?.logo === 'string' ? initialData.logo : ''
  );
  const [existingCoverUrl, setExistingCoverUrl] = useState<string>(
    typeof initialData?.coverImage === 'string' ? initialData.coverImage : ''
  );
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');

  const [currentPlan, setCurrentPlan] = useState(
    initialData?.currentPlan ?? 'Starter Plan'
  );
  const [startDate, setStartDate] = useState(
    initialData?.startDate ?? '22/11/2026'
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate ?? '22/11/2026'
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    initialData?.subscriptionStatus ?? 'نشط'
  );

  useEffect(() => {
    if (!shop) return;
    setStoreName(shop.name || '');
    setDescription(shop.description || '');
    setPhone(shop.phone || '');
    setEmail(shop.email || '');
    setExistingLogoUrl(shop.logo || '');
    setExistingCoverUrl(shop.cover_image || shop.coverImage || '');
    if (shop.created_at) {
      setSubscriptionDate(formatDisplayDate(shop.created_at));
    }
  }, [shop]);

  // إنشاء وإدارة معاينة صورة الشعار
  useEffect(() => {
    if (!logoFile) {
      setLogoPreview('');
      return;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  // إنشاء وإدارة معاينة صورة الغلاف
  useEffect(() => {
    if (!coverFile) {
      setCoverPreview('');
      return;
    }
    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile]);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error(`حجم الصورة يجب ألا يتجاوز ${MAX_IMAGE_SIZE_MB} ميجابايت`);
      e.target.value = '';
      return;
    }

    if (target === 'logo') {
      setLogoFile(file);
    } else {
      setCoverFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      toast.error('يرجى إدخال اسم المتجر');
      return;
    }

    try {
      const updatedRes = await updateShopMutation.mutateAsync({
        name: storeName.trim(),
        description: description.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        logo: logoFile ?? (existingLogoUrl || undefined),
        coverImage: coverFile ?? (existingCoverUrl || undefined),
      });

      if (updatedRes?.data) {
        setExistingLogoUrl(updatedRes.data.logo || existingLogoUrl);
        setExistingCoverUrl(
          updatedRes.data.cover_image ||
          updatedRes.data.coverImage ||
          existingCoverUrl
        );
      }
      setLogoFile(null);
      setCoverFile(null);

      toast.success('تم تحديث بيانات المتجر بنجاح');

      onSaveSubscription?.({
        storeName: storeName.trim(),
        description: description.trim(),
        subscriptionDate,
        mainAddress,
        subAddress,
        phone: phone.trim(),
        email: email.trim(),
        logo: logoFile ?? existingLogoUrl,
        coverImage: coverFile ?? existingCoverUrl,
        currentPlan,
        startDate,
        endDate,
        subscriptionStatus,
        logoText: storeName.trim() || initialData?.logoText || 'ZARA',
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'فشل تحديث بيانات المتجر'
      );
    }
  };

  const handleLogout = async () => {
    if (onLogoutClick) {
      onLogoutClick();
      return;
    }
    await logout();
  };

  const generalItems: {
    key: 'orders' | 'notifications' | 'markets' | 'brands';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
      { key: 'orders', label: 'الطلبات', icon: ClipboardList },
      { key: 'notifications', label: 'الاشعارات', icon: Bell },
      { key: 'markets', label: 'المتاجر', icon: Store },
      { key: 'brands', label: 'العلامات التجارية', icon: Tag },
    ];

  const brandHeading = storeName.trim() || initialData?.logoText || 'ZARA';
  const activeLogoSrc = logoPreview || existingLogoUrl;
  const activeCoverSrc = coverPreview || existingCoverUrl;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-stretch">
        {/* القسم الأيمن: الإعدادات العامة والاشتراكات */}
        <div className="lg:col-span-5 lg:pl-8 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">
                الاعدادات
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                الرئيسية &lt; الاعدادت
              </p>
            </div>

            {/* الإعدادات العامة */}
            <div className="space-y-3">
              <h2 className="text-sm md:text-base font-bold text-gray-900">
                الاعدادات العامة
              </h2>

              <div className="divide-y divide-gray-200 border-b border-gray-200">
                {generalItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onGeneralItemClick?.(item.key)}
                      className="w-full py-2.5 px-1 flex items-center justify-between text-xs md:text-sm font-medium text-gray-800 hover:text-brand transition-colors cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <Icon className="w-4 h-4 text-gray-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* الاشتراكات */}
            <div className="space-y-4 pt-1">
              <h2 className="text-sm md:text-base font-bold text-gray-900">
                الاشتراكات
              </h2>

              <div className="flex justify-center py-1">
                <div className="relative w-24 h-20 flex items-center justify-center">
                  <div className="w-16 h-12 rounded-md bg-amber-100/90 border border-amber-200/80 -rotate-6 translate-x-2 translate-y-1" />
                  <div className="w-16 h-14 rounded-md bg-surface border border-gray-200 shadow-2xs flex flex-col justify-center gap-1.5 px-2.5 -translate-x-1">
                    <span className="h-1 w-full rounded bg-gray-300" />
                    <span className="h-1 w-4/5 rounded bg-gray-300" />
                    <span className="h-1 w-3/5 rounded bg-gray-200" />
                  </div>
                  <FileText className="w-4 h-4 text-brand/70 absolute bottom-1 right-3" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-900">
                    الخطة الحالية
                  </label>
                  <input
                    type="text"
                    value={currentPlan}
                    onChange={(e) => setCurrentPlan(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-900">
                    تاريخ البدء
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    dir="ltr"
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-500 text-right focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-900">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    dir="ltr"
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-500 text-right focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-900">
                    حالة الاشتراك
                  </label>
                  <input
                    type="text"
                    value={subscriptionStatus}
                    onChange={(e) => setSubscriptionStatus(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onPlansClick}
                    className="px-6 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    باقات الاشتراك
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 border-b border-gray-200 flex items-center justify-between text-xs md:text-sm font-medium text-gray-800 hover:text-brand transition-colors cursor-pointer"
            >
              <span>تسجيل الخروج</span>
              <LogOut className="w-4 h-4 text-gray-700 shrink-0" />
            </button>
          </div>
        </div>

        {/* القسم الأيسر: إعدادات المتجر */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 lg:border-r lg:border-gray-300 lg:pr-8 space-y-5"
        >
          <div className="text-center space-y-4">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              اعدادات المتجر
            </h2>

            <div className="flex justify-center py-2">
              <span
                className="text-3xl md:text-5xl font-serif tracking-wide text-gray-900 select-none"
                dir="ltr"
              >
                {isLoadingShop ? '...' : brandHeading}
              </span>
            </div>
          </div>

          <div className="max-w-md mx-auto space-y-3.5">
            {/* اسم المتجر */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900">
                اسم المتجر *
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                disabled={isLoadingShop}
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand"
              />
            </div>

            {/* وصف المتجر */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900">
                وصف المتجر
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoadingShop}
                placeholder="نبذة مختصرة عن المتجر..."
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand"
              />
            </div>

            {/* تاريخ الاشتراك */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900">
                تاريخ الاشتراك
              </label>
              <input
                type="text"
                value={subscriptionDate}
                onChange={(e) => setSubscriptionDate(e.target.value)}
                dir="ltr"
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-600 text-right focus:outline-none focus:border-brand"
              />
            </div>

            {/* عنوان المتجر الرئيسي */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900">
                عنوان المتجر الرئيسي
              </label>
              <input
                type="text"
                value={mainAddress}
                onChange={(e) => setMainAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand"
              />
            </div>

            {/* العناوين الفرعية */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900">
                العناوين الفرعية
              </label>
              <div className="relative">
                <select
                  value={subAddress}
                  onChange={(e) => setSubAddress(e.target.value)}
                  aria-label="العناوين الفرعية"
                  className="w-full appearance-none px-3.5 py-2 pl-9 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand cursor-pointer"
                >
                  {subAddresses.map((addr) => (
                    <option key={addr} value={addr}>
                      {addr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* رقم الهاتف */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoadingShop}
                dir="ltr"
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 text-right focus:outline-none focus:border-brand"
              />
            </div>

            {/* البريد الالكتروني */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900">
                البريد الالكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoadingShop}
                dir="ltr"
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 text-right focus:outline-none focus:border-brand"
              />
            </div>

            {/* رفع الشعار وصورة الغلاف من الجهاز */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* الشعار Logo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-900">
                  شعار المتجر (Logo)
                </label>
                <label className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 border border-dashed border-gray-300 hover:border-brand rounded-lg bg-surface cursor-pointer transition-colors text-center">
                  {activeLogoSrc ? (
                    <img
                      crossOrigin="anonymous"
                      src={activeLogoSrc}
                      alt="معاينة الشعار"
                      className="w-14 h-14 object-cover rounded-md border border-gray-200"
                    />
                  ) : (
                    <Upload className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-[11px] text-gray-600 truncate max-w-full">
                    {logoFile ? logoFile.name : 'اختر صورة من جهازك'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isLoadingShop}
                    onChange={(e) => handleImageChange(e, 'logo')}
                    className="hidden"
                  />
                </label>
                {logoFile && (
                  <button
                    type="button"
                    onClick={() => setLogoFile(null)}
                    className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:underline cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    إلغاء الملف المختار
                  </button>
                )}
              </div>

              {/* صورة الغلاف Cover */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-900">
                  صورة الغلاف (Cover)
                </label>
                <label className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 border border-dashed border-gray-300 hover:border-brand rounded-lg bg-surface cursor-pointer transition-colors text-center">
                  {activeCoverSrc ? (
                    <img
                      crossOrigin="anonymous"
                      src={activeCoverSrc}
                      alt="معاينة الغلاف"
                      className="w-full h-14 object-cover rounded-md border border-gray-200"
                    />
                  ) : (
                    <Upload className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-[11px] text-gray-600 truncate max-w-full">
                    {coverFile ? coverFile.name : 'اختر صورة من جهازك'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isLoadingShop}
                    onChange={(e) => handleImageChange(e, 'cover')}
                    className="hidden"
                  />
                </label>
                {coverFile && (
                  <button
                    type="button"
                    onClick={() => setCoverFile(null)}
                    className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:underline cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    إلغاء الملف المختار
                  </button>
                )}
              </div>
            </div>

            {/* زر حفظ التعديلات */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={updateShopMutation.isPending || isLoadingShop}
                className="w-full py-2.5 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-60 text-white text-xs md:text-sm font-semibold transition-colors cursor-pointer"
              >
                {updateShopMutation.isPending
                  ? 'جاري حفظ التعديلات...'
                  : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketSettings;