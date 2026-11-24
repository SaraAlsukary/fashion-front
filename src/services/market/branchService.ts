import { api } from '../api';

export type BranchStatus = 'ACTIVE' | 'INACTIVE' | string;

export interface Branch {
    id: string | number;
    shopId?: string | number;
    name: string;
    address?: string | null;
    phone?: string | null;
    city?: string | null;
    area?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    status?: BranchStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBranchPayload {
    name: string;
    address?: string;
    phone?: string;
    city?: string;
    area?: string;
    latitude?: number;
    longitude?: number;
}

export type UpdateBranchPayload = Partial<CreateBranchPayload>;

export interface UpdateBranchStatusPayload {
    status: BranchStatus;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface BranchApiResponse<T> {
    success?: boolean;
    message?: string;
    data: T;
    meta?: PaginationMeta;
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
        return new Error(serverMessage || 'ليس لديك صلاحية لإدارة فروع المتجر.');
    }

    if (status === 404) {
        return new Error(serverMessage || 'الفرع المطلوب غير موجود.');
    }

    return new Error(serverMessage || fallbackMessage);
};

const BASE_PATH = '/shop-owner/branches';

export const branchService = {
    listBranches: async (): Promise<BranchApiResponse<Branch[]>> => {
        try {
            const res = await api.get(BASE_PATH);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب قائمة الفروع');
        }
    },

    getBranch: async (branchId: string | number): Promise<BranchApiResponse<Branch>> => {
        try {
            const res = await api.get(`${BASE_PATH}/${branchId}`);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب تفاصيل الفرع');
        }
    },

    createBranch: async (data: CreateBranchPayload): Promise<BranchApiResponse<Branch>> => {
        try {
            const res = await api.post(BASE_PATH, data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل إضافة الفرع');
        }
    },

    updateBranch: async (
        branchId: string | number,
        data: UpdateBranchPayload
    ): Promise<BranchApiResponse<Branch>> => {
        try {
            const res = await api.patch(`${BASE_PATH}/${branchId}`, data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل تحديث بيانات الفرع');
        }
    },

    deactivateBranch: async (branchId: string | number): Promise<BranchApiResponse<null>> => {
        try {
            const res = await api.delete(`${BASE_PATH}/${branchId}`);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل إلغاء تفعيل الفرع');
        }
    },

    updateBranchStatus: async (
        branchId: string | number,
        data: UpdateBranchStatusPayload
    ): Promise<BranchApiResponse<Branch>> => {
        try {
            const res = await api.patch(`${BASE_PATH}/${branchId}/status`, data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل تحديث حالة الفرع');
        }
    },
};