import { api } from './api';
import type { Product, ListProductsParams } from './market/productService';

export interface Category {
    id: string | number;
    name: string;
    slug?: string;
    description?: string | null;
    image?: string | null;
    parentId?: string | number | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CategoryApiResponse<T> {
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

    if (status === 404) {
        return new Error(serverMessage || 'التصنيف المطلوب غير موجود.');
    }

    return new Error(serverMessage || fallbackMessage);
};

const BASE_PATH = '/categories';

export const categoryService = {
    listCategories: async (
        params?: Record<string, string | number | boolean | undefined>
    ): Promise<CategoryApiResponse<Category[]>> => {
        try {
            const res = await api.get(BASE_PATH, { params });
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب قائمة التصنيفات');
        }
    },

    getCategoryById: async (
        categoryId: string | number
    ): Promise<CategoryApiResponse<Category>> => {
        try {
            const res = await api.get(`${BASE_PATH}/${categoryId}`);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب تفاصيل التصنيف');
        }
    },

    getCategoryProducts: async (
        categoryId: string | number,
        params?: ListProductsParams
    ): Promise<CategoryApiResponse<Product[]>> => {
        try {
            const res = await api.get(`${BASE_PATH}/${categoryId}/products`, { params });
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب منتجات التصنيف');
        }
    },
};