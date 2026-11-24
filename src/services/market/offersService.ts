import { api, BASE_URL } from '../api';

export type ApiDiscountType = 'PERCENTAGE' | 'FIXED';
export type ApiOfferStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DRAFT';

export interface OfferProductRef {
  product: {
    id: string;
    name: string;
    price?: number | string;
    sale_price?: number | string | null;
    status?: string;
  };
}

export interface OfferApi {
  id: string;
  shop_id?: string;
  title: string;
  description?: string | null;
  image?: string | null;
  discount_type?: ApiDiscountType | string;
  discountType?: ApiDiscountType | string;
  discount_value?: number | string;
  discountValue?: number | string;
  start_at?: string;
  startAt?: string;
  end_at?: string;
  endAt?: string;
  status?: string;
  configured_status?: string;
  effective_status?: string;
  created_at?: string;
  updated_at?: string;
  offerProducts?: OfferProductRef[];
}

export interface OffersListResponse {
  success?: boolean;
  message?: string;
  data: OfferApi[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateOfferPayload {
  title: string;
  description?: string;
  image?: string;
  discountType: ApiDiscountType;
  discountValue: number;
  startAt: string;
  endAt: string;
  productIds?: string[];
}

export interface UpdateOfferPayload {
  title?: string;
  description?: string;
  image?: string;
  discountType?: ApiDiscountType;
  discountValue?: number;
  startAt?: string;
  endAt?: string;
  productIds?: string[];
}

export interface ListOffersParams {
  page?: number;
  limit?: number;
  status?: string;
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
    return new Error(
      serverMessage || 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.'
    );
  }

  if (status === 403) {
    return new Error(
      serverMessage || 'ليس لديك صلاحية لإدارة العروض.'
    );
  }

  return new Error(serverMessage || fallbackMessage);
};

export const resolveOfferImage = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${BASE_URL}${normalized}`;
};

const BASE_PATH = '/shop-owner/offers';

export const offersService = {
  listOffers: async (params?: ListOffersParams): Promise<OffersListResponse> => {
    try {
      const cleanParams: Record<string, string | number> = {};
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;
      if (params?.status) cleanParams.status = params.status;

      const res = await api.get(BASE_PATH, { params: cleanParams });
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'تعذر جلب قائمة العروض');
    }
  },

  getOffer: async (
    offerId: string
  ): Promise<{ success?: boolean; data: OfferApi }> => {
    try {
      const res = await api.get(`${BASE_PATH}/${offerId}`);
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'تعذر جلب تفاصيل العرض');
    }
  },

  createOffer: async (
    payload: CreateOfferPayload
  ): Promise<{ success?: boolean; message?: string; data: OfferApi }> => {
    try {
      const res = await api.post(BASE_PATH, payload);
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'فشل إنشاء العرض');
    }
  },

  updateOffer: async (
    offerId: string,
    payload: UpdateOfferPayload
  ): Promise<{ success?: boolean; message?: string; data: OfferApi }> => {
    try {
      const res = await api.patch(`${BASE_PATH}/${offerId}`, payload);
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'فشل تحديث العرض');
    }
  },

  deleteOffer: async (
    offerId: string
  ): Promise<{ success?: boolean; message?: string }> => {
    try {
      const res = await api.delete(`${BASE_PATH}/${offerId}`);
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'فشل حذف العرض');
    }
  },

  updateOfferStatus: async (
    offerId: string,
    status: string
  ): Promise<{ success?: boolean; message?: string; data?: OfferApi }> => {
    try {
      const res = await api.patch(`${BASE_PATH}/${offerId}/status`, { status });
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'فشل تحديث حالة العرض');
    }
  },
};