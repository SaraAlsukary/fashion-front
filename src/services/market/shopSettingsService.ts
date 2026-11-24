import { api } from '../api';

export interface ShopProfile {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  cover_image?: string | null;
  coverImage?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: string;
  rejection_reason?: string | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateShopPayload {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  logo?: File | string | null;
  coverImage?: File | string | null;
  cover_image?: File | string | null;
}

export interface ShopApiResponse {
  success?: boolean;
  message?: string;
  data: ShopProfile;
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
      serverMessage || 'ليس لديك صلاحية لتعديل بيانات المتجر.'
    );
  }

  return new Error(serverMessage || fallbackMessage);
};

const buildShopFormData = (data: UpdateShopPayload): FormData => {
  const formData = new FormData();

  if (data.name !== undefined) formData.append('name', data.name);
  if (data.description !== undefined)
    formData.append('description', data.description);
  if (data.phone !== undefined) formData.append('phone', data.phone);
  if (data.email !== undefined) formData.append('email', data.email);

  if (data.logo instanceof File) {
    formData.append('logo', data.logo);
  } else if (typeof data.logo === 'string' && data.logo.trim() !== '') {
    formData.append('logo', data.logo.trim());
  }

  const cover = data.coverImage ?? data.cover_image;
  if (cover instanceof File) {
    formData.append('coverImage', cover);
  } else if (typeof cover === 'string' && cover.trim() !== '') {
    formData.append('coverImage', cover.trim());
  }

  return formData;
};

const BASE_PATH = '/shop-owner/shop';

export const shopService = {
  getMyShop: async (): Promise<ShopApiResponse> => {
    try {
      const res = await api.get(BASE_PATH);
      return res.data;
    } catch (error) {
      throw normalizeError(error, 'تعذر جلب بيانات المتجر');
    }
  },

  updateMyShop: async (data: UpdateShopPayload): Promise<ShopApiResponse> => {
    try {
      const hasFile =
        data.logo instanceof File ||
        data.coverImage instanceof File ||
        data.cover_image instanceof File;

      const payload = hasFile ? buildShopFormData(data) : data;

      const res = await api.patch(BASE_PATH, payload, {
        headers: hasFile
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined,
      });

      return res.data;
    } catch (error) {
      throw normalizeError(error, 'فشل تحديث بيانات المتجر');
    }
  },
};