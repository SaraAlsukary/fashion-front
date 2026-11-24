import React from 'react';

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            dir="rtl"
            className="min-h-screen w-full bg-gradient-to-br from-brand-wine via-brand-plum to-brand-deep flex items-center justify-center p-4 relative overflow-hidden font-sans"
        >
            {/* المنحنيات الديكورية في الخلفية لتطابق التصميم */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-surface/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-ink/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* البطاقة البيضاء الرئيسية المنتصفة */}
            <div className="relative w-full max-w-md bg-surface rounded-[40px] shadow-2xl p-8 md:p-10 z-10 border border-surface/20 my-8">
                {children}
            </div>
        </div>
    );
};

export default LoginLayout;