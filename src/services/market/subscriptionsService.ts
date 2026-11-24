import { api } from '../api';

export interface SubscriptionPlanApi {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  duration: number;
  duration_unit?: string;
  durationUnit?: string;
  features?: string[];
  status?: number | string;
}

export interface ShopSubscriptionApi {
  id: string;
  shop_id?: string;
  plan_id?: string;
  start_at?: string;
  startAt?: string;
  end_at?: string;
  endAt?: string;
  price: number | string;
  status: string;
  created_at?: string;
  updated_at?: string;
  plan?: SubscriptionPlanApi;
}

export interface CurrentSubscriptionResponse {
  success?: boolean;
  message?: string;
  data: ShopSubscriptionApi | null;
}

export interface SubscriptionHistoryResponse {
  success?: boolean;
  message?: string;
  data: ShopSubscriptionApi[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubscriptionPlansResponse {
  success?: boolean;
  message?: string;
  data: SubscriptionPlanApi[];
}

export interface RequestSubscriptionPayload {
  planId: string;
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
      serverMessage || 'ليس لديك صلاحية لإدارة الاشتراكات.'
    );
  }

  return new Error(serverMessage || fallbackMessage);
};

const BASE_PATH = '/shop-owner/subscription';

export const subscriptionsService = {
  getCurrentSubscription: async (): Promise<CurrentSubscriptionResponse> => {
    try {
      const res = await api.get(BASE_PATH);
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'تعذر جلب الاشتراك الحالي');
    }
  },

  getSubscriptionHistory: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<SubscriptionHistoryResponse> => {
    try {
      const cleanParams: Record<string, number> = {};
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;

      const res = await api.get(`${BASE_PATH}/history`, {
        params: cleanParams,
      });
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'تعذر جلب سجل الاشتراكات');
    }
  },

  listPlans: async (): Promise<SubscriptionPlansResponse> => {
    try {
      const res = await api.get(`${BASE_PATH}/plans`);
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'تعذر جلب الباقات المتاحة');
    }
  },

  requestSubscription: async (
    payload: RequestSubscriptionPayload
  ): Promise<{
    success?: boolean;
    message?: string;
    data?: ShopSubscriptionApi;
  }> => {
    try {
      const res = await api.post(BASE_PATH, payload);
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'فشل إرسال طلب الاشتراك');
    }
  },
};