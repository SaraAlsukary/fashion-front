import { api } from './api';

export interface ShopBranchData {
    id: string;
    name: string;
    address?: string | null;
    city?: string | null;
    area?: string | null;
    phone?: string | null;
    working_hours?: string | null;
    latitude?: string | number | null;
    longitude?: string | number | null;
    image?: string | null;
}

export interface ShopDetailsData {
    id: string;
    name: string;
    description?: string | null;
    logo?: string | null;
    cover_image?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    whatsapp_url?: string | null;
    phone?: string | null;
    email?: string | null;
    status?: string;
    created_at?: string;
    approved_at?: string | null;
    branches?: ShopBranchData[];
    _count?: {
        products?: number;
        branches?: number;
        reviews?: number;
    };
}

export interface ShopProductImage {
    id: string | number;
    image: string;
    is_primary?: boolean;
    sort_order?: number;
}

export interface ShopProductItem {
    id: string | number;
    name: string;
    description?: string | null;
    price: number | string;
    sale_price?: number | string | null;
    shop_id?: string | number;
    shop?: {
        id: string | number;
        name?: string;
    };
    images?: ShopProductImage[];
}

export interface ShopReviewItem {
    id: string | number;
    rating: number;
    comment?: string | null;
    created_at?: string;
    user?: {
        id?: string | number;
        name?: string;
        email?: string;
    };
}

export interface ShopReviewsSummary {
    averageRating?: number;
    totalReviews?: number;
    breakdown?: Record<string, number>;
}

const extractArray = <T>(payload: unknown, keys: string[]): T[] => {
    if (Array.isArray(payload)) return payload as T[];
    if (!payload || typeof payload !== 'object') return [];

    const record = payload as Record<string, unknown>;
    for (const key of keys) {
        if (Array.isArray(record[key])) return record[key] as T[];
    }

    if (record.data && typeof record.data === 'object') {
        const nested = record.data as Record<string, unknown>;
        if (Array.isArray(nested)) return nested as T[];
        for (const key of keys) {
            if (Array.isArray(nested[key])) return nested[key] as T[];
        }
    }

    return [];
};

const extractObject = <T>(payload: unknown, keys: string[]): T | null => {
    if (!payload || typeof payload !== 'object') return null;
    const record = payload as Record<string, unknown>;

    if (record.data && typeof record.data === 'object') {
        const nested = record.data as Record<string, unknown>;
        for (const key of keys) {
            if (nested[key] && typeof nested[key] === 'object') {
                return nested[key] as T;
            }
        }
        return nested as T;
    }

    for (const key of keys) {
        if (record[key] && typeof record[key] === 'object') {
            return record[key] as T;
        }
    }

    return record as T;
};

export const shopDetailsService = {
    getShopById: async (shopId: string): Promise<ShopDetailsData | null> => {
        const res = await api.get(`/shops/${shopId}`);
        return extractObject<ShopDetailsData>(res.data, ['shop', 'item']);
    },

    getBranches: async (
        shopId: string,
        embeddedBranches?: ShopBranchData[]
    ): Promise<ShopBranchData[]> => {
        try {
            const res = await api.get(`/shops/${shopId}/branches`);
            const list = extractArray<ShopBranchData>(res.data, [
                'branches',
                'items',
                'data',
            ]);
            if (list.length > 0) return list;
            return embeddedBranches ?? [];
        } catch {
            return embeddedBranches ?? [];
        }
    },

    getProducts: async (shopId: string): Promise<ShopProductItem[]> => {
        const res = await api.get('/products', {
            params: { shopId, shop_id: shopId },
        });
        const list = extractArray<ShopProductItem>(res.data, [
            'products',
            'items',
            'data',
        ]);

        return list.filter((item) => {
            const ownerId = item.shop_id ?? item.shop?.id;
            return ownerId === undefined || String(ownerId) === String(shopId);
        });
    },

    getReviews: async (shopId: string): Promise<ShopReviewItem[]> => {
        const res = await api.get(`/shops/${shopId}/reviews`);
        return extractArray<ShopReviewItem>(res.data, ['reviews', 'items', 'data']);
    },

    getReviewsSummary: async (
        shopId: string
    ): Promise<ShopReviewsSummary | null> => {
        const res = await api.get(`/shops/${shopId}/reviews/summary`);
        return extractObject<ShopReviewsSummary>(res.data, ['summary', 'stats']);
    },

    createReview: async (
        shopId: string,
        payload: { rating: number; comment: string }
    ): Promise<void> => {
        await api.post(`/api/v1/shops/${shopId}/reviews`, payload);
    },
};