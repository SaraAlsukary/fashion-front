import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useVerifyEmail, useResendVerificationEmail } from '../hooks/useAuth';

interface LocationState {
    email?: string;
}

const CODE_LENGTH = 6;

const VerifyEmail: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const state = (location.state as LocationState | null) ?? null;

    const email = (state?.email || searchParams.get('email') || '').trim();

    const verifyMutation = useVerifyEmail();
    const resendMutation = useResendVerificationEmail();

    const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [errorMsg, setErrorMsg] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const submitCode = (fullCode: string) => {
        setErrorMsg('');

        if (!email) {
            setErrorMsg('لم يتم العثور على البريد الإلكتروني، يرجى العودة وإنشاء الحساب مجدداً.');
            return;
        }

        if (fullCode.length !== CODE_LENGTH) {
            setErrorMsg('يرجى إدخال رمز التحقق المكوّن من 6 أرقام بالكامل.');
            return;
        }

        verifyMutation.mutate(
            { email, code: fullCode },
            {
                onSuccess: () => {
                    toast.success('تم تأكيد البريد الإلكتروني بنجاح');
                    navigate('/');
                },
                onError: (err) => {
                    setErrorMsg(err.message);
                    toast.error(err.message);
                },
            }
        );
    };

    const handleDigitChange = (index: number, value: string) => {
        setErrorMsg('');
        const clean = value.replace(/\D/g, '');

        if (!clean) {
            const next = [...digits];
            next[index] = '';
            setDigits(next);
            return;
        }

        // إذا أدخل أو لصق أكثر من رقم في مربع واحد
        if (clean.length > 1) {
            const chars = clean.slice(0, CODE_LENGTH).split('');
            const next = Array(CODE_LENGTH).fill('');
            chars.forEach((ch, i) => {
                next[i] = ch;
            });
            setDigits(next);
            const focusIdx = Math.min(chars.length, CODE_LENGTH - 1);
            inputRefs.current[focusIdx]?.focus();
            if (chars.length === CODE_LENGTH) {
                submitCode(next.join(''));
            }
            return;
        }

        const next = [...digits];
        next[index] = clean;
        setDigits(next);

        if (index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        const joined = next.join('');
        if (joined.length === CODE_LENGTH) {
            submitCode(joined);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            const next = [...digits];
            next[index - 1] = '';
            setDigits(next);
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        setErrorMsg('');
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
        if (!pasted) return;

        const next = Array(CODE_LENGTH).fill('');
        pasted.split('').forEach((ch, idx) => {
            next[idx] = ch;
        });
        setDigits(next);

        const lastIdx = Math.min(pasted.length - 1, CODE_LENGTH - 1);
        inputRefs.current[lastIdx]?.focus();

        if (pasted.length === CODE_LENGTH) {
            submitCode(pasted);
        }
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        submitCode(digits.join(''));
    };

    const handleResend = () => {
        if (!email) {
            toast.error('البريد الإلكتروني غير متوفر');
            return;
        }
        if (cooldown > 0) return;

        resendMutation.mutate(
            { email },
            {
                onSuccess: () => {
                    toast.success('تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني');
                    setDigits(Array(CODE_LENGTH).fill(''));
                    setErrorMsg('');
                    setCooldown(60);
                    inputRefs.current[0]?.focus();
                },
                onError: (err) => {
                    toast.error(err.message);
                },
            }
        );
    };

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-[#6b1d37] mb-2">
                تأكيد البريد الإلكتروني
            </h1>

            <p className="text-xs md:text-sm text-gray-600 mb-2 max-w-md">
                أدخل رمز التحقق المكوّن من 6 أرقام الذي تم إرساله إلى:
            </p>

            {/* عرض البريد الإلكتروني كنص ثابت غير قابل للتعديل */}
            <div className="mb-6 px-4 py-1.5 rounded-full bg-[#6b1d37]/10 border border-[#6b1d37]/25 text-[#6b1d37] font-bold text-xs md:text-sm select-all" dir="ltr">
                {email || '—'}
            </div>

            {errorMsg && (
                <div className="w-full mb-4 px-4 py-2.5 bg-red-50 border border-red-300 text-red-700 text-xs md:text-sm rounded-2xl">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleVerify} className="w-full space-y-5">
                {/* 6 مربعات لرمز التحقق */}
                <div
                    dir="ltr"
                    className="flex items-center justify-center gap-2 sm:gap-3"
                >
                    {digits.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => {
                                inputRefs.current[idx] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                            maxLength={6}
                            value={digit}
                            disabled={verifyMutation.isPending}
                            aria-label={`الرقم ${idx + 1} من رمز التحقق`}
                            onChange={(e) => handleDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            onPaste={handlePaste}
                            className={`w-11 h-12 sm:w-12 sm:h-14 rounded-2xl border-2 text-center text-xl font-bold transition-all focus:outline-none ${
                                errorMsg
                                    ? 'border-red-400 bg-red-50/40 text-red-700'
                                    : digit
                                    ? 'border-[#6b1d37] bg-white text-[#6b1d37] shadow-sm'
                                    : 'border-[#6b1d37]/30 bg-gray-100/70 text-gray-800 focus:bg-white focus:border-[#6b1d37] focus:ring-2 focus:ring-[#6b1d37]/15'
                            }`}
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={verifyMutation.isPending || digits.join('').length !== CODE_LENGTH}
                    className="w-full py-3.5 bg-[#6b1d37] hover:bg-[#52162a] text-white font-semibold rounded-full shadow-md transition-all duration-200 text-base md:text-lg flex items-center justify-center disabled:opacity-60 cursor-pointer"
                >
                    {verifyMutation.isPending ? 'جاري التحقق...' : 'تأكيد الحساب'}
                </button>
            </form>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs md:text-sm text-gray-600">
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendMutation.isPending || cooldown > 0 || !email}
                    className="text-[#9e2b52] font-bold hover:underline disabled:opacity-50 disabled:no-underline bg-transparent border-none cursor-pointer"
                >
                    {resendMutation.isPending
                        ? 'جاري الإرسال...'
                        : cooldown > 0
                        ? `إعادة إرسال الرمز خلال (${cooldown}ث)`
                        : 'إعادة إرسال رمز التحقق'}
                </button>

                <span className="hidden sm:inline text-gray-300">|</span>

                <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-gray-600 hover:text-gray-900 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                >
                    تغيير البريد الإلكتروني
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;