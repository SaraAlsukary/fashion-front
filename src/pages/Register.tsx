import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const registerMutation = useRegister();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        passwordConfirmation: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        passwordConfirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateField = (name: string, value: string, allData = formData) => {
        if (name === 'name') {
            if (!value.trim()) return 'الاسم مطلوب';
        }
        if (name === 'email') {
            if (!value) return 'البريد الإلكتروني مطلوب';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return 'صيغة البريد الإلكتروني غير صالحة';
        }
        if (name === 'phone') {
            if (!value.trim()) return 'رقم الهاتف مطلوب';
            const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
            if (!phoneRegex.test(value.trim())) return 'صيغة رقم الهاتف غير صالحة';
        }
        if (name === 'password') {
            if (!value) return 'كلمة السر مطلوبة';
            if (value.length < 6) return 'يجب أن تكون كلمة السر 6 أحرف على الأقل';
        }
        if (name === 'passwordConfirmation') {
            if (!value) return 'تأكيد كلمة السر مطلوب';
            if (value !== allData.password) return 'كلمتا السر غير متطابقتين';
        }
        return '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);

        const nextErrors = {
            ...errors,
            [name]: validateField(name, value, updatedData),
        };
        if (name === 'password' && formData.passwordConfirmation) {
            nextErrors.passwordConfirmation = validateField(
                'passwordConfirmation',
                formData.passwordConfirmation,
                updatedData
            );
        }
        setErrors(nextErrors);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const nameErr = validateField('name', formData.name);
        const emailErr = validateField('email', formData.email);
        const phoneErr = validateField('phone', formData.phone);
        const passErr = validateField('password', formData.password);
        const confirmErr = validateField('passwordConfirmation', formData.passwordConfirmation);

        if (nameErr || emailErr || phoneErr || passErr || confirmErr) {
            setErrors({
                name: nameErr,
                email: emailErr,
                phone: phoneErr,
                password: passErr,
                passwordConfirmation: confirmErr,
            });
            return;
        }

        registerMutation.mutate(formData, {
            onSuccess: (data) => {
                toast.success('تم إنشاء الحساب، يرجى تأكيد بريدك الإلكتروني');
                const targetEmail = data.user?.email || data.data?.user?.email || formData.email;
                navigate('/verify-email', {
                    state: { email: targetEmail },
                });
            },
            onError: (error) => {
                toast.error(error.message);
            },
        });
    };

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#6b1d37] mb-6">
                إنشاء حساب جديد
            </h1>

            {registerMutation.isError && (
                <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-full">
                    فشل إنشاء الحساب، يرجى مراجعة المدخلات.
                </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-3">
                <div className="w-full">
                    <input
                        type="text"
                        name="name"
                        placeholder="الاسم"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-6 py-3 bg-gray-200/70 border ${errors.name ? 'border-red-500' : 'border-transparent'
                            } rounded-full text-center text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#6b1d37] transition-all`}
                        disabled={registerMutation.isPending}
                    />
                    {errors.name && <span className="text-red-500 text-xs mt-0.5 block px-4">{errors.name}</span>}
                </div>

                <div className="w-full">
                    <input
                        type="email"
                        name="email"
                        placeholder="البريد الإلكتروني"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-6 py-3 bg-gray-200/70 border ${errors.email ? 'border-red-500' : 'border-transparent'
                            } rounded-full text-center text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#6b1d37] transition-all`}
                        disabled={registerMutation.isPending}
                    />
                    {errors.email && <span className="text-red-500 text-xs mt-0.5 block px-4">{errors.email}</span>}
                </div>

                <div className="w-full">
                    <input
                        type="tel"
                        name="phone"
                        placeholder="رقم الهاتف"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-6 py-3 bg-gray-200/70 border ${errors.phone ? 'border-red-500' : 'border-transparent'
                            } rounded-full text-center text-gray-800 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#6b1d37] transition-all`}
                        disabled={registerMutation.isPending}
                    />
                    {errors.phone && <span className="text-red-500 text-xs mt-0.5 block px-4">{errors.phone}</span>}
                </div>

                <div className="w-full">
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="كلمة السر"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-6 py-3 bg-white border-2 ${errors.password ? 'border-red-500' : 'border-[#6b1d37]/40'
                                } rounded-full text-center text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#6b1d37] transition-all`}
                            disabled={registerMutation.isPending}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#6b1d37] focus:outline-none"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m14.41 14.41l-3.59-3.59" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && <span className="text-red-500 text-xs mt-0.5 block px-4">{errors.password}</span>}
                </div>

                <div className="w-full">
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="passwordConfirmation"
                            placeholder="تأكيد كلمة السر"
                            value={formData.passwordConfirmation}
                            onChange={handleChange}
                            className={`w-full px-6 py-3 bg-white border-2 ${errors.passwordConfirmation ? 'border-red-500' : 'border-[#6b1d37]/40'
                                } rounded-full text-center text-gray-800 placeholder-gray-500 focus:outline-none focus:border-[#6b1d37] transition-all`}
                            disabled={registerMutation.isPending}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#6b1d37] focus:outline-none"
                        >
                            {showConfirmPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m14.41 14.41l-3.59-3.59" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.passwordConfirmation && (
                        <span className="text-red-500 text-xs mt-0.5 block px-4">{errors.passwordConfirmation}</span>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full py-3.5 bg-[#6b1d37] hover:bg-[#52162a] text-white font-semibold rounded-full shadow-md transition-all duration-200 text-lg mt-2 flex items-center justify-center disabled:opacity-70"
                >
                    {registerMutation.isPending ? (
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        'تسجيل حساب'
                    )}
                </button>
            </form>

            <div className="mt-6 text-sm text-gray-600">
                لديك حساب بالفعل ؟{' '}
                <button onClick={() => navigate('/')} className="text-[#9e2b52] font-bold hover:underline bg-transparent border-none cursor-pointer">
                    تسجيل الدخول
                </button>
            </div>
            <div className="mt-3 text-sm text-gray-600">
                هل ترغب بفتح متجر؟{' '}
                <button
                    type="button"
                    onClick={() => navigate('/create-shop')}
                    className="text-brand font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                    انضم كصاحب متجر
                </button>
            </div>
            <div className="mt-4">
                <button
                    type="button"
                    onClick={() => alert('ميزة التسجيل عبر جوجل قيد التفعيل')}
                    className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-2 px-4 rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                    <span>أو قم بالتسجيل عن طريق غوغل</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Register;