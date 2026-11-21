import React from 'react';

const LoginLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div dir="rtl" className="min-h-screen w-full bg-gradient-to-br from-[#802342] via-[#9e2b52] to-[#58152c] flex items-center justify-center p-4 relative overflow-hidden font-sans">

            {/* المنحنيات الديكورية في الخلفية لتطابق التصميم */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-black/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* البطاقة البيضاء الرئيسية المنتصفة */}
            <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 md:p-10 z-10 border border-white/20 my-8">
                {children}
            </div>
        </div>
    );
};

export default LoginLayout;