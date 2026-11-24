import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Store, Upload, CheckCircle2 } from 'lucide-react';
import { useMyShop, useUpdateMyShop } from '../../hooks/useShop';

const CreateShop: React.FC = () => {
    const navigate = useNavigate();
    const { data: myShopRes, isLoading: isLoadingShop } = useMyShop();
    const updateShopMutation = useUpdateMyShop();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        phone: '',
        email: '',
        logo: '',
        coverImage: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
    });

    useEffect(() => {
        const shop = myShopRes?.data;
        if (shop) {
            setFormData({
                name: shop.name || '',
                description: shop.description || '',
                phone: shop.phone || '',
                email: shop.email || '',
                logo: shop.logo || '',
                coverImage: shop.coverImage || '',
            });
        }
    }, [myShopRes]);

    const handleFileToDataUrl = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'logo' | 'coverImage'
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const nextErrors = { name: '', email: '' };
        if (!formData.name.trim()) {
            nextErrors.name = 'اسم المتجر مطلوب';
        }
        if (formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                nextErrors.email = 'صيغة البريد الإلكتروني غير صالحة';
            }
        }

        if (nextErrors.name || nextErrors.email) {
            setErrors(nextErrors);
            return;
        }

        updateShopMutation.mutate(
            {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                email: formData.email.trim() || undefined,
                logo: formData.logo.trim() || undefined,
                coverImage: formData.coverImage.trim() || undefined,
            },
            {
                onSuccess: () => {
                    toast.success('تم حفظ بيانات المتجر وإرسالها للمراجعة');
                    navigate('/market');
                },
                onError: (err) => {
                    toast.error(err.message);
                },
            }
        );
    };

    return (
        <div className="w-full space-y-4">
            <div className="text-center space-y-1">
                <div className="w-11 h-11 rounded-full bg-[#6b1d37]/10 text-[#6b1d37] flex items-center justify-center mx-auto">
                    <Store className="w-5 h-5" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-[#6b1d37]">
                    إنشاء وإعداد المتجر
                </h1>
                <p className="text-xs text-gray-500">
                    أدخل بيانات متجرك ليتم إرسالها للمراجعة والاعتماد من الإدارة
                </p>

                {myShopRes?.data?.status && (
                    <div className="pt-1">
                        <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            الحالة الحالية: {myShopRes.data.status}
                        </span>
                    </div>
                )}
            </div>

            {isLoadingShop ? (
                <div className="h-56 rounded-2xl border border-gray-200 bg-gray-100/70 animate-pulse" />
            ) : (
                <form onSubmit={handleSubmit} className="space-y-2.5">
                    <div>
                        <input
                            type="text"
                            placeholder="اسم المتجر *"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                            className={`w-full px-4 py-2.5 text-xs md:text-sm bg-gray-200/70 border rounded-full text-center text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#6b1d37] transition-all ${
                                errors.name ? 'border-red-500' : 'border-transparent'
                            }`}
                        />
                        {errors.name && (
                            <span className="text-red-500 text-[11px] mt-0.5 block text-center">
                                {errors.name}
                            </span>
                        )}
                    </div>

                    <div>
                        <input
                            type="email"
                            placeholder="بريد التواصل الخاص بالمتجر (اختياري)"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (errors.email) setErrors({ ...errors, email: '' });
                            }}
                            className={`w-full px-4 py-2.5 text-xs md:text-sm bg-gray-200/70 border rounded-full text-center text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#6b1d37] transition-all ${
                                errors.email ? 'border-red-500' : 'border-transparent'
                            }`}
                        />
                        {errors.email && (
                            <span className="text-red-500 text-[11px] mt-0.5 block text-center">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div>
                        <input
                            type="tel"
                            placeholder="رقم الهاتف (اختياري)"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2.5 text-xs md:text-sm bg-gray-200/70 border border-transparent rounded-full text-center text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#6b1d37] transition-all"
                        />
                    </div>

                    <div>
                        <textarea
                            rows={2}
                            placeholder="وصف مختصر عن المتجر..."
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full px-4 py-2.5 text-xs md:text-sm bg-gray-200/70 border border-transparent rounded-2xl text-center text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#6b1d37] transition-all resize-none"
                        />
                    </div>

                    {/* شعار وصورة غلاف المتجر */}
                    <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                        <div className="border border-gray-200 rounded-2xl p-2.5 bg-gray-50/70 flex flex-col items-center justify-between gap-2">
                            <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6b1d37] hover:underline cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                <span>شعار المتجر</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileToDataUrl(e, 'logo')}
                                    className="hidden"
                                />
                            </label>
                            {formData.logo ? (
                                <img
                                    src={formData.logo}
                                    alt="شعار المتجر"
                                    className="w-12 h-12 object-cover rounded-xl border border-gray-200 bg-white"
                                />
                            ) : (
                                <span className="text-[10px] text-gray-400">غير محدد</span>
                            )}
                        </div>

                        <div className="border border-gray-200 rounded-2xl p-2.5 bg-gray-50/70 flex flex-col items-center justify-between gap-2">
                            <label className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6b1d37] hover:underline cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                <span>صورة الغلاف</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileToDataUrl(e, 'coverImage')}
                                    className="hidden"
                                />
                            </label>
                            {formData.coverImage ? (
                                <img
                                    src={formData.coverImage}
                                    alt="غلاف المتجر"
                                    className="w-full h-12 object-cover rounded-xl border border-gray-200 bg-white"
                                />
                            ) : (
                                <span className="text-[10px] text-gray-400">غير محدد</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                            رجوع
                        </button>
                        <button
                            type="submit"
                            disabled={updateShopMutation.isPending}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#6b1d37] hover:bg-[#52162a] disabled:opacity-60 text-white text-xs md:text-sm font-semibold shadow-md transition-colors cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                                {updateShopMutation.isPending
                                    ? 'جاري الحفظ...'
                                    : 'حفظ وإرسال للمراجعة'}
                            </span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CreateShop;