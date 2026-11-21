import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, type LoginPayload, type RegisterPayload, type ChangePasswordPayload } from '../services/authService';

export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: LoginPayload) => authService.login(data),
        onSuccess: (data) => {
            if (data.token) {
                localStorage.setItem('token', data.token);
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
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            localStorage.removeItem('token');
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