import { api, BASE_URL } from './api';

export interface HomeCategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  parent_id?: string | null;
}

export interface HomeProductImage {
  id: string;
  image: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface HomeProductVariant {
  id: string;
  price: number | string;
  sale_price?: number | string | null;
  sku?: string;
  color?: { id: string; name: string; hex_code?: string | null } | null;
  size?: { id: string; name: string; type?: string } | null;
}

export interface HomeProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  sale_price?: number | string | null;
  status?: string;
  created_at?: string;
  category?: { id: string; name: string; slug?: string } | null;
  brand?: { id: string; name: string } | null;
  shop?: {
    id: string;
    name: string;
    logo?: string | null;
    status?: string;
  } | null;
  images?: HomeProductImage[];
  variants?: HomeProductVariant[];
}

export interface HomeShop {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  status?: string;
}

export interface HomeOffer {
  id: string;
  shop_id?: string;
  title: string;
  description?: string | null;
  image?: string | null;
  discount_type?: string;
  discount_value?: number | string;
  start_at?: string;
  end_at?: string;
  status?: string;
}

export interface HomeContentData {
  categories?: HomeCategory[];
  featuredProducts?: HomeProduct[];
  newArrivals?: HomeProduct[];
  onSaleProducts?: HomeProduct[];
  featuredShops?: HomeShop[];
  activeOffers?: HomeOffer[];
}

export const resolveHomeMediaUrl = (url?: string | null): string | undefined => {
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

export const homeService = {
  getHome: async (): Promise<{
    success?: boolean;
    message?: string;
    data: HomeContentData;
  }> => {
    const res = await api.get('/home');
    return res.data;
  },

  getOnSale: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get('/home/on-sale', { params });
    return res.data;
  },

  getFeaturedShops: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get('/home/featured-shops', { params });
    return res.data;
  },

  getFeaturedProducts: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get('/home/featured-products', { params });
    return res.data;
  },

  getNewArrivals: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get('/home/new-arrivals', { params });
    return res.data;
  },

  getActiveOffers: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get('/home/active-offers', { params });
    return res.data;
  },
};