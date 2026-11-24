import { api } from '../api';

export interface DashboardShop {
    id: string;
    name: string;
    description?: string | null;
    logo?: string | null;
    cover_image?: string | null;
    phone?: string | null;
    email?: string | null;
    status?: string;
    rejection_reason?: string | null;
    approved_at?: string | null;
    created_at?: string;
}

export interface DashboardStatistics {
    totalProducts: number;
    activeProducts: number;
    hiddenProducts: number;
    totalOrders: number;
    newOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalSales: number;
    totalPaidOrders: number;
    totalReviews: number;
    averageRating: number;
}

export interface SubscriptionPlanInfo {
    id: string;
    name: string;
    description?: string | null;
    duration?: number;
    duration_unit?: string;
}

export interface CurrentSubscriptionInfo {
    id: string;
    shop_id: string;
    plan_id: string;
    start_at: string;
    end_at: string;
    price: string | number;
    status: string;
    created_at?: string;
    updated_at?: string;
    plan?: SubscriptionPlanInfo;
}

export interface RecentOrderItem {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total: string | number;
    created_at: string;
}

export interface DashboardData {
    shop?: DashboardShop;
    statistics: DashboardStatistics;
    currentSubscription?: CurrentSubscriptionInfo | null;
    subscriptionExpirationDate?: string | null;
    recentOrders?: RecentOrderItem[];
}

export interface DashboardApiResponse {
    success?: boolean;
    message?: string;
    data: DashboardData;
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

    if (status === 401) {
        return new Error(serverMessage || 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.');
    }

    if (status === 403) {
        return new Error(serverMessage || 'ليس لديك صلاحية لعرض إحصائيات المتجر.');
    }

    return new Error(serverMessage || fallbackMessage);
};

const BASE_PATH = '/shop-owner/dashboard';

export const dashboardService = {
    getOverview: async (): Promise<DashboardApiResponse> => {
        try {
            const res = await api.get(BASE_PATH);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب إحصائيات لوحة التحكم');
        }
    },
};