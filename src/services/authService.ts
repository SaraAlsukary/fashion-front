import { api } from './api';

// Interfaces حسب الـ Payload الموضح في Postman
export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    passwordConfirmation: string;
    name: string;
}

export interface AuthResponse {
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        role?:string;
    };
    message?: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
}

export interface ChangePasswordPayload {
    oldPassword?: string;
    password: string;
    passwordConfirmation: string;
}

// دالات الاتصال بالشبكة
export const authService = {
    login: async (data: LoginPayload): Promise<AuthResponse> => {
        const res = await api.post('/auth/login', data);
        return res.data;
    },

    register: async (data: RegisterPayload): Promise<AuthResponse> => {
        const res = await api.post('/auth/register', data);
        return res.data;
    },

    logout: async (): Promise<AuthResponse> => {
        const res = await api.post('/auth/logout');
        return res.data;
    },

    getMe: async (): Promise<UserProfile> => {
        const res = await api.get('/auth/me');
        return res.data;
    },

    changePassword: async (data: ChangePasswordPayload): Promise<AuthResponse> => {
        const res = await api.post('/auth/change-password', data);
        return res.data;
    },
};