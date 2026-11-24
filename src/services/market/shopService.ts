import { api } from '../api';

export type ShopApprovalDecision = 'APPROVED' | 'REJECTED';

export interface ShopData {
    id: string | number;
    name: string;
    description?: string;
    phone?: string;
    email?: string;
    logo?: string;
    coverImage?: string;
    status?: string;
}

export interface UpdateMyShopPayload {
    name?: string;
    description?: string;
    phone?: string;
    email?: string;
    logo?: string;
    coverImage?: string;
}

export interface ListPendingShopsParams {
    status?: string;
    page?: number;
    limit?: number;
}

export interface ShopDecisionPayload {
    decision: ShopApprovalDecision;
    rejectionReason?: string;
}

export interface ShopApiResponse<T> {
    success?: boolean;
    message?: string;
    data: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
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

    if (status === 403) {
        return new Error(serverMessage || 'ليس لديك صلاحية للوصول إلى هذا الإجراء.');
    }

    if (status === 404) {
        return new Error(serverMessage || 'المتجر المطلوب غير موجود.');
    }

    return new Error(serverMessage || fallbackMessage);
};

export const shopService = {
    // --- متجر صاحب المتجر (Shop Owner) ---
    getMyShop: async (): Promise<ShopApiResponse<ShopData>> => {
        try {
            const res = await api.get('/api/v1/shop-owner/shop');
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب بيانات المتجر');
        }
    },

    updateMyShop: async (data: UpdateMyShopPayload): Promise<ShopApiResponse<ShopData>> => {
        try {
            const res = await api.patch('/api/v1/shop-owner/shop', data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل تحديث بيانات المتجر');
        }
    },

    // --- مراجعة وتأكيد المتاجر (Admin Shop Approvals) ---
    listShops: async (
        params: ListPendingShopsParams = { status: 'PENDING', page: 1, limit: 10 }
    ): Promise<ShopApiResponse<ShopData[]>> => {
        try {
            const res = await api.get('/api/v1/admin/shops', { params });
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب قائمة المتاجر');
        }
    },

    decideShopApproval: async (
        shopId: string | number,
        data: ShopDecisionPayload
    ): Promise<ShopApiResponse<ShopData>> => {
        try {
            const res = await api.patch(`/api/v1/admin/shops/${shopId}/decision`, data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل تسجيل قرار المتجر');
        }
    },

    retryDecisionEmail: async (shopId: string | number): Promise<ShopApiResponse<null>> => {
        try {
            const res = await api.post(`/api/v1/admin/shops/${shopId}/decision-email`);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل إعادة إرسال بريد قرار المتجر');
        }
    },
};