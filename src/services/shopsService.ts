import { api } from './api';

export interface ShopListItem {
    id: string;
    name: string;
    description?: string | null;
    logo?: string | null;
    cover_image?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    whatsapp_url?: string | null;
    status?: string;
    created_at?: string;
    approved_at?: string | null;
    _count?: {
        products?: number;
        branches?: number;
        reviews?: number;
    };
}

export interface ShopsPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ShopsListResult {
    shops: ShopListItem[];
    meta?: ShopsPaginationMeta;
}

interface ShopsResponseLike {
    success?: boolean;
    data?:
    | ShopListItem[]
    | {
        shops?: ShopListItem[];
        items?: ShopListItem[];
        data?: ShopListItem[];
    };
    shops?: ShopListItem[];
    items?: ShopListItem[];
    meta?: ShopsPaginationMeta;
}

const extractShops = (payload: unknown): ShopsListResult => {
    if (Array.isArray(payload)) {
        return { shops: payload as ShopListItem[] };
    }
    if (!payload || typeof payload !== 'object') {
        return { shops: [] };
    }

    const p = payload as ShopsResponseLike;
    const meta = p.meta;

    if (Array.isArray(p.data)) {
        return { shops: p.data, meta };
    }
    if (Array.isArray(p.shops)) {
        return { shops: p.shops, meta };
    }
    if (Array.isArray(p.items)) {
        return { shops: p.items, meta };
    }
    if (p.data && typeof p.data === 'object') {
        const nested = p.data.shops ?? p.data.items ?? p.data.data;
        if (Array.isArray(nested)) {
            return { shops: nested, meta };
        }
    }

    return { shops: [], meta };
};

export const isValidImageUrl = (url?: string | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    if (trimmed.includes('example.com')) return false;
    return (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('/') ||
        trimmed.startsWith('data:image/')
    );
};

export const shopsService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<ShopsListResult> => {
        const response = await api.get('/shops', { params });
        return extractShops(response.data);
    },
};