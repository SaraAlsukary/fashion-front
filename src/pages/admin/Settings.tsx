import React, { useRef, useState } from 'react';
import {
  User,
  Paperclip,
  Eye,
  EyeOff,
  ClipboardList,
  Bell,
  Store,
  Tag,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface AdminSettingsFormData {
  name: string;
  joinedAt: string;
  password: string;
  newPassword: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

interface SettingsProps {
  initialData?: Partial<AdminSettingsFormData>;
  onSaveSettings?: (data: AdminSettingsFormData) => void;
  onDeleteAccount?: () => void;
  onGeneralItemClick?: (key: 'orders' | 'notifications' | 'markets' | 'brands') => void;
  onLogoutClick?: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  initialData,
  onSaveSettings,
  onDeleteAccount,
  onGeneralItemClick,
  onLogoutClick,
}) => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(
    initialData?.name ?? user?.name ?? 'محمد محمد'
  );
  const [joinedAt, setJoinedAt] = useState(
    initialData?.joinedAt ?? '22/11/2026'
  );
  const [password, setPassword] = useState(
    initialData?.password ?? 'حلب بليليل'
  );
  const [newPassword, setNewPassword] = useState(
    initialData?.newPassword ?? 'حلب الفرقان'
  );
  const [email, setEmail] = useState(
    initialData?.email ?? user?.email ?? 'moh2323@gmail.com'
  );
  const [phone, setPhone] = useState(
    initialData?.phone ?? user?.phone ?? '096616777787887'
  );
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    initialData?.avatarUrl
  );
  const [showPassword, setShowPassword] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings?.({
      name,
      joinedAt,
      password,
      newPassword,
      email,
      phone,
      avatarUrl: avatarPreview,
    });
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0 items-stretch">
        {/* القسم الأيمن: الإعدادات العامة */}
        <div className="lg:col-span-5 lg:pl-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">
                الاعدادات
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                الرئيسية &lt; الاعدادت
              </p>
            </div>

            <div className="space-y-3 pt-1">
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
                      className="w-full py-3 px-1 flex items-center justify-between text-xs md:text-sm font-medium text-gray-800 hover:text-brand transition-colors cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <Icon className="w-4 h-4 text-gray-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-8 lg:pt-20">
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

        {/* القسم الأيسر: إعدادات الأدمن */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 lg:border-r lg:border-gray-300 lg:pr-8 space-y-4"
        >
          {/* زر حذف الحساب */}
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={onDeleteAccount}
              className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold transition-colors cursor-pointer"
            >
              حذف الحساب
            </button>
          </div>

          {/* عنوان إعدادات الأدمن وصورة الحساب */}
          <div className="text-center space-y-3">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              اعدادات الادمن
            </h2>

            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-2 border-gray-800 bg-surface flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-11 h-11 text-gray-800 stroke-[1.75]" />
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="إرفاق صورة الملف الشخصي"
                className="w-7 h-7 rounded-full bg-surface border border-gray-300 shadow-xs flex items-center justify-center text-gray-700 hover:text-brand hover:border-brand transition-colors cursor-pointer absolute bottom-0 left-0"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* الحقول */}
          <div className="max-w-md mx-auto space-y-3 pt-1">
            {/* الاسم */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900">
                الاسم
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="تعديل الاسم أو المرفق"
                  className="absolute left-3 text-gray-500 hover:text-brand cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* تاريخ الانضمام */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900">
                تاريخ الانضمام
              </label>
              <input
                type="text"
                value={joinedAt}
                onChange={(e) => setJoinedAt(e.target.value)}
                dir="ltr"
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-600 text-right focus:outline-none focus:border-brand"
              />
            </div>

            {/* كلمة المرور */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900">
                كلمة المرور
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                  }
                  className="absolute left-3 text-gray-600 hover:text-brand cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* تغيير كلمة المرور */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-900">
                تغيير كلمة المرور
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-brand"
                />
                <Paperclip className="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none" />
              </div>
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
                dir="ltr"
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 text-right focus:outline-none focus:border-brand"
              />
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
                dir="ltr"
                className="w-full px-3.5 py-2 text-xs md:text-sm bg-surface border border-gray-300 rounded-lg text-gray-700 text-right focus:outline-none focus:border-brand"
              />
            </div>

            {/* زر حفظ التغييرات */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs md:text-sm font-semibold transition-colors cursor-pointer"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;