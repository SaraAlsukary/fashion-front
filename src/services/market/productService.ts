import { api } from '../api';

// ============================================================================
// الأنواع والواجهات (Interfaces & Types)
// ============================================================================

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'HIDDEN' | 'ARCHIVED' | string;
export type SortOrder = 'asc' | 'desc';

export interface ProductImageInput {
    image: string;
    isPrimary?: boolean;
    sortOrder?: number;
}

export interface ProductImage extends ProductImageInput {
    id: string | number;
}

export interface ProductVariantInput {
    colorId: string | number;
    sizeId: string | number;
    price: number;
    salePrice?: number | null;
    sku?: string;
    stock?: number;
}

export interface ProductVariant extends ProductVariantInput {
    id: string | number;
}

export interface Product {
    id: string | number;
    name: string;
    description?: string | null;
    categoryId: string | number;
    brandId?: string | number | null;
    price: number;
    salePrice?: number | null;
    status: ProductStatus;
    images?: ProductImage[];
    variants?: ProductVariant[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ListProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: ProductStatus;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface CreateProductPayload {
    name: string;
    description?: string;
    categoryId: string | number;
    brandId?: string | number | null;
    price: number;
    salePrice?: number | null;
    status?: ProductStatus;
    images?: ProductImageInput[];
    variants?: ProductVariantInput[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface UpdateProductStatusPayload {
    status: ProductStatus;
}

export type UpdateProductImagePayload = Partial<ProductImageInput>;
export type UpdateProductVariantPayload = Partial<ProductVariantInput>;

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiResponse<T> {
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

// ============================================================================
// توحيد معالجة الأخطاء
// ============================================================================

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
        return new Error(serverMessage || 'ليس لديك صلاحية لتنفيذ هذا الإجراء على المنتجات.');
    }

    if (status === 404) {
        return new Error(serverMessage || 'المنتج أو العنصر المطلوب غير موجود.');
    }

    if (status === 409) {
        return new Error(serverMessage || 'يوجد تعارض في البيانات (مثل تكرار رمز SKU).');
    }

    if (status === 429) {
        return new Error(
            serverMessage || 'تم تجاوز عدد الطلبات المسموحة، يرجى الانتظار قليلاً.'
        );
    }

    return new Error(serverMessage || fallbackMessage);
};

const BASE_PATH = '/shop-owner/products';

// ============================================================================
// خدمة التحكم بالمنتجات (Products, Images, Variants)
// ============================================================================

export const productService = {
    // --- المنتجات ---
    listProducts: async (params?: ListProductsParams): Promise<ApiResponse<Product[]>> => {
        try {
            const res = await api.get(BASE_PATH, { params });
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب قائمة المنتجات');
        }
    },

    getProduct: async (productId: string | number): Promise<ApiResponse<Product>> => {
        try {
            const res = await api.get(`${BASE_PATH}/${productId}`);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'تعذر جلب تفاصيل المنتج');
        }
    },

    createProduct: async (data: CreateProductPayload): Promise<ApiResponse<Product>> => {
        try {
            const res = await api.post(BASE_PATH, data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل إضافة المنتج');
        }
    },

    updateProduct: async (
        productId: string | number,
        data: UpdateProductPayload
    ): Promise<ApiResponse<Product>> => {
        try {
            const res = await api.patch(`${BASE_PATH}/${productId}`, data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل تحديث بيانات المنتج');
        }
    },

    archiveProduct: async (productId: string | number): Promise<ApiResponse<null>> => {
        try {
            const res = await api.delete(`${BASE_PATH}/${productId}`);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل أرشفة/حذف المنتج');
        }
    },

    updateProductStatus: async (
        productId: string | number,
        data: UpdateProductStatusPayload
    ): Promise<ApiResponse<Product>> => {
        try {
            const res = await api.patch(`${BASE_PATH}/${productId}/status`, data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل تحديث حالة المنتج');
        }
    },

    // --- صور المنتج ---
    addProductImage: async (
        productId: string | number,
        data: ProductImageInput
    ): Promise<ApiResponse<ProductImage>> => {
        try {
            const res = await api.post(`${BASE_PATH}/${productId}/images`, data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل إضافة صورة للمنتج');
        }
    },

    updateProductImage: async (
        productId: string | number,
        imageId: string | number,
        data: UpdateProductImagePayload
    ): Promise<ApiResponse<ProductImage>> => {
        try {
            const res = await api.patch(`${BASE_PATH}/${productId}/images/${imageId}`, data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل تحديث صورة المنتج');
        }
    },

    deleteProductImage: async (
        productId: string | number,
        imageId: string | number
    ): Promise<ApiResponse<null>> => {
        try {
            const res = await api.delete(`${BASE_PATH}/${productId}/images/${imageId}`);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل حذف صورة المنتج');
        }
    },

    // --- متغيرات المنتج (Variants) ---
    addProductVariant: async (
        productId: string | number,
        data: ProductVariantInput
    ): Promise<ApiResponse<ProductVariant>> => {
        try {
            const res = await api.post(`${BASE_PATH}/${productId}/variants`, data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل إضافة متغير للمنتج');
        }
    },

    updateProductVariant: async (
        productId: string | number,
        variantId: string | number,
        data: UpdateProductVariantPayload
    ): Promise<ApiResponse<ProductVariant>> => {
        try {
            const res = await api.patch(`${BASE_PATH}/${productId}/variants/${variantId}`, data);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل تحديث متغير المنتج');
        }
    },

    deleteProductVariant: async (
        productId: string | number,
        variantId: string | number
    ): Promise<ApiResponse<null>> => {
        try {
            const res = await api.delete(`${BASE_PATH}/${productId}/variants/${variantId}`);
            return res.data;
        } catch (error) {
            throw normalizeError(error, 'فشل حذف متغير المنتج');
        }
    },
};