import { api, BASE_URL } from '../api';

export interface OrderItemApi {
  id?: string;
  title?: string;
  product_name?: string;
  productName?: string;
  product?: {
    id?: string;
    name?: string;
    title?: string;
    image?: string;
    images?: { image?: string; url?: string }[];
  };
  price?: number | string;
  unit_price?: number | string;
  quantity?: number;
  size?: string | { name?: string };
  color?: string | { name?: string; hex?: string };
  colors?: string[];
  imageUrl?: string;
  image?: string;
}

export interface OrderApi {
  id: string;
  order_number?: string;
  orderNumber?: string;
  status?: string;
  payment_status?: string;
  paymentStatus?: string;
  total?: number | string;
  amount?: number | string;
  created_at?: string;
  createdAt?: string;
  date?: string;
  customer_name?: string;
  customerName?: string;
  customer?: {
    name?: string;
    fullName?: string;
    phone?: string;
    email?: string;
  };
  phone?: string;
  shipping_phone?: string;
  address?: string;
  shipping_address?: string | {
    city?: string;
    area?: string;
    street?: string;
    address?: string;
    fullAddress?: string;
  };
  items?: OrderItemApi[];
  order_items?: OrderItemApi[];
  orderItems?: OrderItemApi[];
}

export interface OrdersListResponse {
  success?: boolean;
  message?: string;
  data: OrderApi[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  orderNumber?: string;
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
      serverMessage || 'ليس لديك صلاحية للوصول إلى الطلبات.'
    );
  }

  return new Error(serverMessage || fallbackMessage);
};

export const resolveMediaUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${BASE_URL}${normalizedPath}`;
};

const BASE_PATH = '/shop-owner/orders';

export const ordersService = {
  listOrders: async (params?: ListOrdersParams): Promise<OrdersListResponse> => {
    try {
      const cleanParams: Record<string, string | number> = {};
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;
      if (params?.status) cleanParams.status = params.status;
      if (params?.paymentStatus) cleanParams.paymentStatus = params.paymentStatus;
      if (params?.startDate) cleanParams.startDate = params.startDate;
      if (params?.endDate) cleanParams.endDate = params.endDate;
      if (params?.orderNumber?.trim()) {
        cleanParams.orderNumber = params.orderNumber.trim();
      }

      const res = await api.get(BASE_PATH, { params: cleanParams });
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'تعذر جلب قائمة الطلبات');
    }
  },

  getOrder: async (orderId: string): Promise<{ success?: boolean; data: OrderApi }> => {
    try {
      const res = await api.get(`${BASE_PATH}/${orderId}`);
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'تعذر جلب تفاصيل الطلب');
    }
  },

  updateOrderStatus: async (
    orderId: string,
    status: string
  ): Promise<{ success?: boolean; message?: string; data?: OrderApi }> => {
    try {
      const res = await api.patch(`${BASE_PATH}/${orderId}/status`, { status });
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'فشل تحديث حالة الطلب');
    }
  },
};