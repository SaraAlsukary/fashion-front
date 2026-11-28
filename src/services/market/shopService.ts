import { api } from '../api';

export interface ShopEntity {
    id: string | number;
    owner_id?: string | number;
    name: string;
    description?: string | null;
    logo?: string | null;
    cover_image?: string | null;
    phone?: string | null;
    email?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    whatsapp_url?: string | null;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    rejection_reason?: string | null;
    approved_at?: string | null;
    created_at?: string;
    updated_at?: string;
    owner?: {
        id?: string | number;
        name?: string;
        email?: string;
        phone?: string;
    };
    _count?: {
        products?: number;
        branches?: number;
        orders?: number;
        reviews?: number;
    };
}

export interface UpdateMyShopPayload {
    name?: string;
    description?: string | null;
    logo?: string | null;
    cover_image?: string | null;
    coverImage?: string | null;
    phone?: string | null;
    email?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    whatsapp_url?: string | null;
}

export interface ListPendingShopsParams {
    page?: number;
    limit?: number;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    search?: string;
}

export interface ShopDecisionPayload {
    status: 'APPROVED' | 'REJECTED';
    rejection_reason?: string;
    rejectionReason?: string;
}

export interface ShopsAdminListResponse {
    shops: ShopEntity[];
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const extractShop = (payload: unknown): ShopEntity | null => {
    if (!payload || typeof payload !== 'object') return null;
    const p = payload as Record<string, unknown>;

    if (p.shop && typeof p.shop === 'object') return p.shop as ShopEntity;
    if (p.data && typeof p.data === 'object') {
        const data = p.data as Record<string, unknown>;
        if (data.shop && typeof data.shop === 'object') return data.shop as ShopEntity;
        return data as unknown as ShopEntity;
    }

    return p as unknown as ShopEntity;
};

const extractShopsList = (payload: unknown): ShopsAdminListResponse => {
    if (Array.isArray(payload)) {
        return { shops: payload as ShopEntity[] };
    }
    if (!payload || typeof payload !== 'object') {
        return { shops: [] };
    }

    const p = payload as Record<string, unknown>;
    const meta = p.meta as ShopsAdminListResponse['meta'] | undefined;

    if (Array.isArray(p.data)) {
        return { shops: p.data as ShopEntity[], meta };
    }
    if (Array.isArray(p.shops)) {
        return { shops: p.shops as ShopEntity[], meta };
    }
    if (p.data && typeof p.data === 'object') {
        const data = p.data as Record<string, unknown>;
        const list = data.shops ?? data.items ?? data.data;
        if (Array.isArray(list)) {
            return { shops: list as ShopEntity[], meta };
        }
    }

    return { shops: [], meta };
};

export const shopService = {
    getMyShop: async (): Promise<ShopEntity | null> => {
        const res = await api.get('/shops/me');
        return extractShop(res.data);
    },

    updateMyShop: async (data: UpdateMyShopPayload): Promise<ShopEntity | null> => {
        const res = await api.patch('/shops/me', data);
        return extractShop(res.data);
    },

    listShops: async (
        params?: ListPendingShopsParams
    ): Promise<ShopsAdminListResponse> => {
        const res = await api.get('/admin/shops', { params });
        return extractShopsList(res.data);
    },

    decideShopApproval: async (
        shopId: string | number,
        data: ShopDecisionPayload
    ): Promise<ShopEntity | null> => {
        const res = await api.patch(`/admin/shops/${shopId}/decision`, data);
        return extractShop(res.data);
    },

    retryDecisionEmail: async (shopId: string | number): Promise<unknown> => {
        const res = await api.post(
            `/admin/shops/${shopId}/retry-decision-email`
        );
        return res.data;
    },
};
