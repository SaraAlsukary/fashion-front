import { api } from './api';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    passwordConfirmation: string;
    name: string;
    phone?: string;
}

export interface ResendVerificationEmailPayload {
    email: string;
}

export interface VerifyEmailPayload {
    email: string;
    code: string;
}

export interface AuthUserData {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    email_verified_at?: string | null;
}

export interface AuthResponse {
    success?: boolean;
    message?: string;
    token?: string;
    accessToken?: string;
    tokenType?: string;
    expiresIn?: string;
    user?: AuthUserData;
    data?: {
        user?: AuthUserData;
        accessToken?: string;
        token?: string;
        tokenType?: string;
        expiresIn?: string;
    };
}

export interface UserProfile extends AuthUserData {
    data?: AuthUserData;
    user?: AuthUserData;
}

export interface ChangePasswordPayload {
    oldPassword?: string;
    password: string;
    passwordConfirmation: string;
}

interface ApiErrorLike {
    message?: string;
    response?: {
        status?: number;
        data?: {
            message?: string;
            error?: string;
        };
    };
}

const normalizeError = (error: unknown, fallbackMessage: string): Error => {
    const err = error as ApiErrorLike;
    const status = err?.response?.status;
    const serverMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message;

    if (status === 429) {
        return new Error(
            serverMessage || 'تم تجاوز عدد المحاولات المسموحة، يرجى الانتظار قليلاً ثم المحاولة مجدداً.'
        );
    }

    if (status === 409) {
        return new Error(
            serverMessage || 'البيانات المدخلة مستخدمة مسبقاً.'
        );
    }

    return new Error(serverMessage || fallbackMessage);
};

export const authService = {
    login: async (data: LoginPayload): Promise<AuthResponse> => {
        try {
            const res = await api.post('/auth/login', data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'حدث خطأ أثناء تسجيل الدخول');
        }
    },

    register: async (data: RegisterPayload): Promise<AuthResponse> => {
        try {
            const res = await api.post('/auth/register', data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل إنشاء الحساب');
        }
    },

    resendVerificationEmail: async (
        data: ResendVerificationEmailPayload
    ): Promise<AuthResponse> => {
        try {
            const res = await api.post('/auth/verification-email', data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر إعادة إرسال رمز التحقق');
        }
    },

    verifyEmail: async (data: VerifyEmailPayload): Promise<AuthResponse> => {
        try {
            const res = await api.post('/auth/verify-email', data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'رمز التحقق غير صحيح أو منتهي الصلاحية');
        }
    },

    logout: async (): Promise<AuthResponse> => {
        try {
            const res = await api.post('/auth/logout');
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'حدث خطأ أثناء تسجيل الخروج');
        }
    },

    getMe: async (): Promise<UserProfile> => {
        try {
            const res = await api.get('/auth/me');
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب بيانات المستخدم');
        }
    },

    changePassword: async (data: ChangePasswordPayload): Promise<AuthResponse> => {
        try {
            const res = await api.post('/auth/change-password', data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل تغيير كلمة السر');
        }
    },
};