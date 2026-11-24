import { api } from './api';
import type { Product, ListProductsParams } from './market/productService';

export interface Brand {
    id: string | number;
    name: string;
    slug?: string;
    description?: string | null;
    logo?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface BrandApiResponse<T> {
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
        return new Error(serverMessage || 'العلامة التجارية المطلوبة غير موجودة.');
    }

    return new Error(serverMessage || fallbackMessage);
};

const BASE_PATH = '/brands';

export const brandService = {
    listBrands: async (
        params?: Record<string, string | number | boolean | undefined>
    ): Promise<BrandApiResponse<Brand[]>> => {
        try {
            const res = await api.get(BASE_PATH, { params });
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب قائمة العلامات التجارية');
        }
    },

    getBrandProducts: async (
        brandId: string | number,
        params?: ListProductsParams
    ): Promise<BrandApiResponse<Product[]>> => {
        try {
            const res = await api.get(`${BASE_PATH}/${brandId}/products`, { params });
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب منتجات العلامة التجارية');
        }
    },
};