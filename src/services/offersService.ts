import { api } from './api';
import type { ShopListItem } from './shopsService';

export interface OfferItem {
    id: string;
    title?: string;
    name?: string;
    description?: string | null;
    image?: string | null;
    cover_image?: string | null;
    discount_type?: 'percentage' | 'fixed' | string;
    discount_value?: number | string | null;
    discount?: number | string | null;
    code?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    expires_at?: string | null;
    is_active?: boolean;
    status?: string;
    shops?: ShopListItem[];
    _count?: {
        shops?: number;
        products?: number;
    };
}

export interface OffersPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface OffersListResult {
    offers: OfferItem[];
    meta?: OffersPaginationMeta;
}

export interface OfferDetailResult {
    offer: OfferItem | null;
    shops: ShopListItem[];
}

interface OffersResponseLike {
    data?:
    | OfferItem[]
    | {
        offers?: OfferItem[];
        items?: OfferItem[];
        data?: OfferItem[];
    };
    offers?: OfferItem[];
    items?: OfferItem[];
    meta?: OffersPaginationMeta;
}

interface OfferDetailResponseLike {
    data?: OfferItem & { offer?: OfferItem; shops?: ShopListItem[] };
    offer?: OfferItem;
    shops?: ShopListItem[];
}

interface OfferShopsResponseLike {
    data?:
    | ShopListItem[]
    | {
        shops?: ShopListItem[];
        items?: ShopListItem[];
        data?: ShopListItem[];
    };
    shops?: ShopListItem[];
    items?: ShopListItem[];
}

const isRecord = (val: unknown): val is Record<string, unknown> =>
    typeof val === 'object' && val !== null;

const extractOffers = (payload: unknown): OffersListResult => {
    if (Array.isArray(payload)) {
        return { offers: payload as OfferItem[] };
    }
    if (!isRecord(payload)) {
        return { offers: [] };
    }

    const p = payload as OffersResponseLike;
    const meta = p.meta;

    if (Array.isArray(p.data)) return { offers: p.data, meta };
    if (Array.isArray(p.offers)) return { offers: p.offers, meta };
    if (Array.isArray(p.items)) return { offers: p.items, meta };

    if (isRecord(p.data)) {
        const nested = p.data.offers ?? p.data.items ?? p.data.data;
        if (Array.isArray(nested)) {
            return { offers: nested as OfferItem[], meta };
        }
    }

    return { offers: [], meta };
};

const extractOfferDetail = (payload: unknown): OfferDetailResult => {
    if (!isRecord(payload)) {
        return { offer: null, shops: [] };
    }

    const p = payload as OfferDetailResponseLike;
    const rawOffer =
        (isRecord(p.data) && isRecord(p.data.offer)
            ? p.data.offer
            : isRecord(p.data)
                ? p.data
                : isRecord(p.offer)
                    ? p.offer
                    : isRecord(payload) && 'id' in payload
                        ? (payload as any)
                        : null) as OfferItem | null;

    const shopsFromDetail = Array.isArray(p.shops)
        ? p.shops
        : isRecord(p.data) && Array.isArray(p.data.shops)
            ? p.data.shops
            : Array.isArray(rawOffer?.shops)
                ? rawOffer.shops
                : [];

    return { offer: rawOffer, shops: shopsFromDetail };
};

const extractShopsFromOffer = (payload: unknown): ShopListItem[] => {
    if (Array.isArray(payload)) {
        return payload as ShopListItem[];
    }
    if (!isRecord(payload)) {
        return [];
    }

    const p = payload as OfferShopsResponseLike;
    if (Array.isArray(p.data)) return p.data;
    if (Array.isArray(p.shops)) return p.shops;
    if (Array.isArray(p.items)) return p.items;

    if (isRecord(p.data)) {
        const nested = p.data.shops ?? p.data.items ?? p.data.data;
        if (Array.isArray(nested)) {
            return nested as ShopListItem[];
        }
    }

    return [];
};

export const isValidImageUrl = (url?: string | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed || trimmed.includes('example.com')) return false;
    return (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('/') ||
        trimmed.startsWith('data:image/')
    );
};

export const getOfferTitle = (offer: OfferItem): string =>
    offer.title?.trim() || offer.name?.trim() || 'عرض خاص';

export const formatOfferDiscount = (offer: OfferItem): string | null => {
    const rawVal = offer.discount_value ?? offer.discount;
    if (rawVal === undefined || rawVal === null || rawVal === '') return null;
    const num = Number(rawVal);
    if (Number.isNaN(num)) return String(rawVal);
    if (offer.discount_type === 'fixed') {
        return `خصم ${num} ل.س.ج`;
    }
    return `خصم ${num}%`;
};

export const offersService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        activeOnly?: boolean;
    }): Promise<OffersListResult> => {
        const endpoint = params?.activeOnly ? '/home/active-offers' : '/offers';
        const response = await api.get(endpoint, {
            params: params?.activeOnly ? undefined : params,
        });
        return extractOffers(response.data);
    },

    getById: async (offerId: string): Promise<OfferDetailResult> => {
        const response = await api.get(`/offers/${offerId}`);
        return extractOfferDetail(response.data);
    },

    getOfferShops: async (offerId: string): Promise<ShopListItem[]> => {
        try {
            const response = await api.get(`/offers/${offerId}/shops`);
            return extractShopsFromOffer(response.data);
        } catch {
            return [];
        }
    },

    getShopOffers: async (shopId: string): Promise<OfferItem[]> => {
        const response = await api.get(`/shops/${shopId}/offers`);
        return extractOffers(response.data).offers;
    },
};