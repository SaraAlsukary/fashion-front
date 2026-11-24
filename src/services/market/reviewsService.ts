import { api } from '../api';

export interface ReviewApi {
  id: string;
  rating: number | string;
  comment?: string | null;
  status?: string;
  created_at?: string;
  createdAt?: string;
  customerDisplayName?: string;
  customer_name?: string;
  customerName?: string;
}

export interface ReviewsListResponse {
  success?: boolean;
  message?: string;
  data: ReviewApi[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewSummaryResponse {
  success?: boolean;
  message?: string;
  data: {
    totalReviews?: number;
    averageRating?: number | string;
    ratingBreakdown?: Record<string, number>;
    [key: string]: unknown;
  };
}

export interface ListReviewsParams {
  page?: number;
  limit?: number;
  rating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
      serverMessage || 'ليس لديك صلاحية للوصول إلى مراجعات المتجر.'
    );
  }

  return new Error(serverMessage || fallbackMessage);
};

const BASE_PATH = '/shop-owner/reviews';

export const reviewsService = {
  listReviews: async (
    params?: ListReviewsParams
  ): Promise<ReviewsListResponse> => {
    try {
      const cleanParams: Record<string, string | number> = {};
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;
      if (params?.rating) cleanParams.rating = params.rating;
      if (params?.sortBy) cleanParams.sortBy = params.sortBy;
      if (params?.sortOrder) cleanParams.sortOrder = params.sortOrder;

      const res = await api.get(BASE_PATH, { params: cleanParams });
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'تعذر جلب مراجعات المتجر');
    }
  },

  getReviewSummary: async (): Promise<ReviewSummaryResponse> => {
    try {
      const res = await api.get(`${BASE_PATH}/summary`);
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'تعذر جلب ملخص التقييمات');
    }
  },
};