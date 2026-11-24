import { api } from './api';
import {
  resolveHomeMediaUrl,
  type HomeCategory,
  type HomeProduct,
} from './homeService';

export interface CatalogBrand {
  id: string;
  name: string;
  logo?: string | null;
}

export interface ProductsListResponse {
  success?: boolean;
  message?: string;
  data: HomeProduct[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const catalogService = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    size?: string;
    sortByPrice?: 'asc' | 'desc';
  }): Promise<ProductsListResponse> => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  getCategories: async (): Promise<{
    success?: boolean;
    data: HomeCategory[];
  }> => {
    const res = await api.get('/categories');
    return res.data;
  },

  getBrands: async (): Promise<{
    success?: boolean;
    data: CatalogBrand[];
  }> => {
    const res = await api.get('/brands');
    return res.data;
  },
};

export { resolveHomeMediaUrl };