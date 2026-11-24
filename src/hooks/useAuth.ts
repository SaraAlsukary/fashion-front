import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    authService,
    type LoginPayload,
    type RegisterPayload,
    type ResendVerificationEmailPayload,
    type VerifyEmailPayload,
    type ChangePasswordPayload,
} from '../services/authService';

interface AuthResponseLike {
    token?: string;
    accessToken?: string;
    data?: {
        token?: string;
        accessToken?: string;
    };
}

const extractAccessToken = (res: unknown): string | undefined => {
    const payload = res as AuthResponseLike | undefined;
    return (
        payload?.data?.accessToken ??
        payload?.data?.token ??
        payload?.accessToken ??
        payload?.token
    );
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: LoginPayload) => authService.login(data),
        onSuccess: (data) => {
            const token = extractAccessToken(data);
            if (token) {
                localStorage.setItem('token', token);
            }
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: RegisterPayload) => authService.register(data),
        onSuccess: (data) => {
            const token = extractAccessToken(data);
            if (token) {
                localStorage.setItem('token', token);
            }
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
};

export const useResendVerificationEmail = () => {
    return useMutation({
        mutationFn: (data: ResendVerificationEmailPayload) =>
            authService.resendVerificationEmail(data),
    });
};

export const useVerifyEmail = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: VerifyEmailPayload) => authService.verifyEmail(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => authService.logout(),
        onSettled: () => {
            localStorage.removeItem('token');
            queryClient.removeQueries({ queryKey: ['me'] });
            queryClient.clear();
        },
    });
};

export const useUserMe = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: authService.getMe,
        enabled: !!localStorage.getItem('token'),
        retry: false,
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordPayload) => authService.changePassword(data),
    });
};